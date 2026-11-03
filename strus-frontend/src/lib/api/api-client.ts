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
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const responseData = error.response?.data as ApiFailure | undefined;
    const errorCode = responseData?.code;

    // Treat as expired if it's a 401 and not an explicit revocation or login failure
    const isUnauthorized = error.response?.status === 401;
    const isNotLoginOrRefresh = originalRequest && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh') && !originalRequest.url?.includes('/auth/google');
    const isExplicitlyRevoked = errorCode === "SESSION_REVOKED" || errorCode === "INVALID_CREDENTIALS" || errorCode === "PASSWORD_NOT_SET";
    
    if (
      isUnauthorized &&
      !isExplicitlyRevoked &&
      isNotLoginOrRefresh &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Direct axios call to avoid interceptor loop
        const response = await axios.post(`${env.API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        tokenManager.setTokens(accessToken, newRefreshToken);
        onRefreshed(accessToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenManager.clearTokens();
        // Force redirect to login via location if refresh fails completely
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && errorCode === "SESSION_REVOKED") {
      tokenManager.clearTokens();
      window.location.href = "/login";
    }

    const sanitizedFallbackError = {
      success: false,
      message: "Unable to connect to the server. Please check your network connection.",
      code: "NETWORK_ERROR"
    };

    return Promise.reject(responseData || sanitizedFallbackError);
  }
);
