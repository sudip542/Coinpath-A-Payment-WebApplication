import { BASE_API_URL, LOGIN_PAGE_URL } from "@/utils/config/url";

export const ACCESS_TOKEN_KEY = "showzen_token";
export const REFRESH_TOKEN_KEY = "showzen_refresh_token";
export const USER_KEY = "showzen_user";

// Secondary keys for fallback compatibility
const FALLBACK_ACCESS_TOKEN_KEY = "accessToken";
const FALLBACK_REFRESH_TOKEN_KEY = "refreshToken";

interface AccessTokenOptionsProps {
  isSetToken?: boolean;
}

export interface BackendTokenRefreshData {
  accessToken: string;
  tokenType?: string;
  refreshToken?: string;
  expiresInMs?: number;
}

export interface ApiResponseEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

/**
 * Retrieve the current access token directly from localStorage.
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    localStorage.getItem(FALLBACK_ACCESS_TOKEN_KEY) ||
    localStorage.getItem("token")
  );
}

/**
 * Retrieve the current refresh token directly from localStorage.
 */
export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    localStorage.getItem(FALLBACK_REFRESH_TOKEN_KEY)
  );
}

/**
 * Store access and optional refresh tokens in localStorage.
 */
export function setStoredTokens(
  accessToken: string,
  refreshToken?: string | null,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(FALLBACK_ACCESS_TOKEN_KEY, accessToken);

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(FALLBACK_REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (error) {
    console.error("Failed to persist tokens in localStorage:", error);
  }
}

/**
 * Remove all authentication tokens and cached user data from localStorage.
 */
export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(FALLBACK_ACCESS_TOKEN_KEY);
    localStorage.removeItem(FALLBACK_REFRESH_TOKEN_KEY);
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Failed to remove tokens from localStorage:", error);
  }
}

/**
 * Fetches a valid access token.
 * If token is not present or refresh is forced via options.isSetToken,
 * attempts to exchange the refresh token with the backend.
 */
export async function getValidAccessToken(
  options?: AccessTokenOptionsProps,
): Promise<string | null> {
  // If not forcing a refresh, return the existing stored token if available
  if (!options?.isSetToken) {
    const accessToken = getStoredAccessToken();
    if (accessToken) {
      return accessToken;
    }
  }

  const refreshToken = getStoredRefreshToken();
  if (refreshToken) {
    // Refresh token is available, attempt to refresh
    const newAccessToken = await refreshAccessToken(
      refreshToken,
      options?.isSetToken,
    );
    if (newAccessToken) {
      return newAccessToken;
    }
  }

  // If tokens are missing or refresh failed, return null
  return null;
}

/**
 * Calls backend `/api/v1/auth/refresh` using the provided refreshToken.
 */
export async function refreshAccessToken(
  refreshToken: string,
  isSetToken?: boolean,
): Promise<string | null> {
  try {
    const baseUrl = BASE_API_URL || "";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    const response = await fetch(`${cleanBaseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const json: unknown = await response.json();

      // Backend wraps in ApiResponse<TokenRefreshResponse>
      const parsed = json as
        | ApiResponseEnvelope<BackendTokenRefreshData>
        | BackendTokenRefreshData;

      const data =
        "data" in parsed && parsed.data
          ? parsed.data
          : (parsed as BackendTokenRefreshData);

      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken || refreshToken;

      if (newAccessToken) {
        if (isSetToken === undefined || isSetToken) {
          setStoredTokens(newAccessToken, newRefreshToken);
        }
        return newAccessToken;
      }
    } else {
      console.warn(
        "Refresh token invalid or expired with status:",
        response.status,
      );
    }
  } catch (error) {
    console.error("Failed to refresh access token:", error);
  }

  return null;
}

/**
 * Clear stored auth credentials and redirect user to the login route.
 */
export function clearTokensAndLogout(): void {
  clearStoredTokens();
  if (typeof window !== "undefined") {
    const loginUrl = LOGIN_PAGE_URL || "/login";
    // Avoid re-triggering redirect if already on login page
    if (window.location.pathname !== loginUrl) {
      window.location.href = loginUrl;
    }
  }
}
