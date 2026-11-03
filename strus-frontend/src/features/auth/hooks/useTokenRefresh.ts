import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { tokenManager } from '../../../lib/auth/token-manager';
import { env } from '../../../lib/config/env';
import axios from 'axios';

export function useTokenRefresh() {
  const { user } = useAuthStore();

  useEffect(() => {
    // If not logged in, no need to refresh
    if (!user) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleRefresh = () => {
      // Refresh every 14 minutes (15 min expiry)
      // 14 minutes = 14 * 60 * 1000 = 840000 ms
      timeoutId = setTimeout(async () => {
        try {
          const refreshToken = tokenManager.getRefreshToken();
          if (!refreshToken) {
             useAuthStore.getState().clearAuth();
             return;
          }

          // We use raw axios here to avoid triggering the apiClient interceptors directly
          // in a way that might loop or cause unnecessary state changes.
          const response = await axios.post(`${env.API_BASE_URL}/auth/refresh-token`, { refreshToken });
          
          if (response.data?.success && response.data?.data) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            tokenManager.setTokens(accessToken, newRefreshToken);
            // Re-schedule after successful refresh
            scheduleRefresh();
          } else {
            // Failed structure, clear auth
            useAuthStore.getState().clearAuth();
          }
        } catch (error) {
          console.error('Failed to proactively refresh token', error);
          // If refresh fails, clear auth so interceptors will eventually push to login
          tokenManager.clearTokens();
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
        }
      }, 14 * 60 * 1000); 
    };

    // Start the cycle
    scheduleRefresh();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user]);
}
