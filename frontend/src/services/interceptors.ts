import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { generateUUID } from "@/lib/utils";

const TOKEN_KEY = "coinpath_access_token";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore local storage restrictions
  }
}

export function requestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  // Attach correlation ID if not set
  if (!config.headers["X-Correlation-ID"]) {
    config.headers["X-Correlation-ID"] = generateUUID();
  }

  // Attach auth token if available
  const token = getStoredToken();
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
}

export function responseSuccessInterceptor(response: AxiosResponse): AxiosResponse {
  // Capture correlation ID from response headers if present
  const correlationId = response.headers["x-correlation-id"];
  if (correlationId && typeof window !== "undefined") {
    (window as unknown as { __lastCorrelationId?: string }).__lastCorrelationId = correlationId;
  }
  return response;
}

export function responseErrorInterceptor(error: AxiosError): Promise<never> {
  if (error.response?.status === 401) {
    // Only clear token if we're not attempting login
    if (!error.config?.url?.includes("/api/auth/login")) {
      setStoredToken(null);
      // Dispatch custom event so app can redirect if needed
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("coinpath:unauthorized"));
      }
    }
  }
  return Promise.reject(error);
}
