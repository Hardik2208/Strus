import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";
import { tokenManager } from "../auth/token-manager";
import type { ApiFailure } from "./api-error";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser generate the multipart boundary.
    // Do not send the global application/json header with FormData.
    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      config.headers.delete("Content-Type");
    }

    return config;
  },
  (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response) => response.data,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const responseData = error.response?.data as
      | ApiFailure
      | undefined;

    const errorCode = responseData?.code;

    const isUnauthorized = error.response?.status === 401;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh-token') ||
      originalRequest?.url?.includes('/auth/google');

    const isExplicitlyRevoked =
      errorCode === 'SESSION_REVOKED' ||
      errorCode === 'INVALID_CREDENTIALS' ||
      errorCode === 'PASSWORD_NOT_SET';

    if (
      isUnauthorized &&
      !isAuthEndpoint &&
      !isExplicitlyRevoked &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (
      isUnauthorized &&
      errorCode === 'SESSION_REVOKED'
    ) {
      tokenManager.clearTokens();
      window.location.href = '/login';
    }

    return Promise.reject(
      responseData || {
        success: false,
        message: 'Unable to connect to the server.',
        code: 'NETWORK_ERROR',
      }
    );
  }
);



let refreshTimer: ReturnType<typeof setTimeout> | null = null;

const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return typeof decoded.exp === 'number'
      ? decoded.exp * 1000
      : null;
  } catch {
    return null;
  }
};

const scheduleTokenRefresh = (token: string) => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  const expiry = getTokenExpiry(token);

  if (!expiry) return;

  const refreshIn = expiry - Date.now() - 60_000;

  refreshTimer = setTimeout(() => {
    refreshAccessToken().catch(() => {
      // Refresh failure is handled by refreshAccessToken.
    });
  }, Math.max(refreshIn, 0));
};



const refreshAccessToken = async (): Promise<string> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh(resolve);
      // Existing refresh subscribers are success-only.
      // Failed refreshes are handled by the initiating request.
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${env.API_BASE_URL}/auth/refresh-token`,
      { refreshToken }
    );

    const { accessToken, refreshToken: newRefreshToken } =
      response.data.data;

    tokenManager.setTokens(accessToken, newRefreshToken);

    scheduleTokenRefresh(accessToken);

    onRefreshed(accessToken);

    return accessToken;
  } catch (error) {
    refreshSubscribers = [];
    tokenManager.clearTokens();

    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }

    window.location.href = '/login';

    throw error;
  } finally {
    isRefreshing = false;
  }
};
