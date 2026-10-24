import { BASE_API_URL } from "@/utils/config/url";
import axios, {
  AxiosError,
  type AxiosResponse,
  type AxiosInstance as AxiosType,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearTokensAndLogout,
  getValidAccessToken,
} from "./tokenManagement";

export const axiosInstance: AxiosType = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  maxBodyLength: Infinity,
});

// Request interceptor to automatically attach access token from localStorage
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Only attach if Authorization header is not explicitly passed
    if (!config.headers.Authorization) {
      const token = await getValidAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

// Response interceptor to handle 401 Unauthorized by refreshing token and retrying
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Do not attempt refresh on auth endpoints to avoid recursive loops
    const requestUrl = originalRequest?.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/api/v1/auth/login") ||
      requestUrl.includes("/api/v1/auth/register") ||
      requestUrl.includes("/api/v1/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the access token using refreshToken stored in localStorage
        const refreshedToken = await getValidAccessToken({ isSetToken: true });
        if (refreshedToken) {
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
          return axiosInstance(originalRequest);
        } else {
          clearTokensAndLogout();
        }
      } catch (refreshError) {
        clearTokensAndLogout();
        return Promise.reject(
          refreshError instanceof Error
            ? refreshError
            : new Error(String(refreshError)),
        );
      }
    }

    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);
