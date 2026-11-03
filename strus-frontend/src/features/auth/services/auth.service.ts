import { apiClient } from "../../../lib/api/api-client";
import { tokenManager } from "../../../lib/auth/token-manager";
import { useAuthStore } from "../store/auth.store";
import type { AuthenticatedUser, AuthResponse, Session } from "../types/auth.types";
import type { ApiSuccess } from "../../../lib/api/api-error";
import { getDeviceInformation } from "../../../lib/device/device-info";
import { queryClient } from "../../../lib/api/query-client";

export const authService = {
  async register(data: any) {
    const res = await apiClient.post<any, ApiSuccess<null>>("/auth/register", data);
    return res;
  },

  async verifyEmail(data: any) {
    const deviceInfo = getDeviceInformation();
    const payload = { ...data, ...deviceInfo };
    const res = await apiClient.post<any, ApiSuccess<AuthResponse>>("/auth/verify-email", payload);
    
    tokenManager.setTokens(res.data.accessToken, res.data.refreshToken);
    await this.getMe();
    return res;
  },

  async resendOtp(email: string) {
    return apiClient.post<any, ApiSuccess<null>>("/auth/resend-otp", { email });
  },

  async login(data: any) {
    const deviceInfo = getDeviceInformation();
    const payload = { ...data, ...deviceInfo };
    const res = await apiClient.post<any, ApiSuccess<AuthResponse>>("/auth/login", payload);
    
    tokenManager.setTokens(res.data.accessToken, res.data.refreshToken);
    await this.getMe();
    return res;
  },

  async googleLogin(idToken: string) {
    const deviceInfo = getDeviceInformation();
    const payload = { idToken, ...deviceInfo };
    const res = await apiClient.post<any, ApiSuccess<AuthResponse>>("/auth/google", payload);
    
    tokenManager.setTokens(res.data.accessToken, res.data.refreshToken);
    await this.getMe();
    return res;
  },

  async getMe() {
    try {
      const res = await apiClient.get<any, ApiSuccess<AuthenticatedUser>>("/auth/me");
      const store = useAuthStore.getState();
      store.setAuth(res.data, tokenManager.getAccessToken() || "", res.data.profileCompleted);
      return res;
    } catch (error) {
      useAuthStore.getState().clearAuth();
      tokenManager.clearTokens();
      throw error;
    }
  },
  async logout() {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      await apiClient.post("/auth/logout", { refreshToken });
    } finally {
      useAuthStore.getState().clearAuth();
      tokenManager.clearTokens();
      queryClient.clear();
    }
  },

  async logoutAll() {
    try {
      await apiClient.post("/auth/logout-all");
    } finally {
      useAuthStore.getState().clearAuth();
      tokenManager.clearTokens();
      queryClient.clear();
    }
  },

  async getSessions() {
    return apiClient.get<any, ApiSuccess<{ sessions: Session[] }>>("/auth/sessions");
  },

  async revokeSession(sessionId: string) {
    return apiClient.delete<any, ApiSuccess<null>>(`/auth/sessions/${sessionId}`);
  },

  async revokeOtherSessions() {
    return apiClient.delete<any, ApiSuccess<null>>("/auth/sessions/others");
  },

  async changePassword(data: any) {
    return apiClient.patch<any, ApiSuccess<null>>("/auth/password", data);
  },

  async forgotPassword(email: string) {
    return apiClient.post<any, ApiSuccess<null>>("/auth/forgot-password", { email });
  },

  async verifyForgotPassword(data: any) {
    return apiClient.post<any, ApiSuccess<{ resetToken: string }>>("/auth/verify-forgot-password", data);
  },

  async resetPassword(data: any) {
    return apiClient.post<any, ApiSuccess<null>>("/auth/reset-password", data);
  }
};
