import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosInstance";

export interface AxiosBaseQueryArgs {
  apiUrl?: string;
  url?: string;
  config?: AxiosRequestConfig;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  body?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
  rawResponse?: boolean;
}

export interface AxiosBaseQueryError {
  status: unknown;
  data: unknown | string;
}

/** Server error bodies typically carry one of these fields from Spring Boot GlobalExceptionHandler */
interface ApiErrorBody {
  message?: string;
  error?: string;
  code?: string;
  status?: number;
  path?: string;
  validationErrors?: Record<string, string>;
}

/**
 * Extracts a human-readable message from the error shape returned by
 * {@link axiosBaseQuery} (`{ status, data }`), an RTK Query error, a plain
 * `Error`, or a string.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  // RTK Query error envelope: { status, data }
  if (typeof err === "object" && "data" in err) {
    const { data } = err as { data: unknown };
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const body = data as ApiErrorBody;

      // Surface field validation errors if provided by backend
      if (body.validationErrors && typeof body.validationErrors === "object") {
        const fieldMsgs = Object.values(body.validationErrors).filter(Boolean);
        if (fieldMsgs.length > 0) {
          return fieldMsgs.join(", ");
        }
      }

      if (body.message) return body.message;
      if (body.error) return body.error;
    }
  }

  if (err instanceof Error && err.message) return err.message;

  if (typeof err === "object" && "message" in err) {
    const { message } = err;
    if (typeof message === "string" && message) return message;
  }

  return fallback;
}

/**
 * RTK Query base query adapter for the shared axiosInstance.
 *
 * Token management (attach from localStorage, refresh on 401, logout) is fully
 * handled automatically by axiosInstance interceptors — no manual token logic is needed.
 */
export function axiosBaseQuery(
  { baseUrl }: { baseUrl?: string } = { baseUrl: "" },
): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> {
  return async (args: AxiosBaseQueryArgs) => {
    try {
      const targetUrl = args.apiUrl || args.url || "";
      let fullUrl = targetUrl;

      // Attach baseUrl if provided and target is relative
      if (baseUrl && !targetUrl.startsWith("http")) {
        const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPath = targetUrl.startsWith("/") ? targetUrl : `/${targetUrl}`;
        fullUrl = `${cleanBase}${cleanPath}`;
      }

      // Merge config and root-level shorthand parameters
      const incomingConfig = args.config ? { ...args.config } : {};
      const method = incomingConfig.method || args.method || "GET";
      const data = incomingConfig.data ?? args.data ?? args.body;
      const params = incomingConfig.params ?? args.params;

      const incomingHeaders = {
        ...(incomingConfig.headers || {}),
        ...(args.headers || {}),
      };

      const hasContentType = Object.keys(incomingHeaders).some(
        (k) => k.toLowerCase() === "content-type",
      );

      const headers = { ...incomingHeaders };
      // Default to application/json if not multipart FormData
      if (!hasContentType && !(data instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const mergedConfig: AxiosRequestConfig = {
        ...incomingConfig,
        method,
        data,
        params,
        headers,
      };

      const result = await axiosInstance(fullUrl, mergedConfig);

      let payload = result.data;
      // Automatically unwrap Spring Boot ApiResponse { success: true, message: "...", data: T }
      if (
        !args.rawResponse &&
        payload &&
        typeof payload === "object" &&
        "success" in payload &&
        "data" in payload
      ) {
        payload = (payload as { data: unknown }).data;
      }

      return { data: payload };
    } catch (axiosError) {
      const error = axiosError as AxiosError<unknown>;
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data ?? { message: error.message },
        },
      };
    }
  };
}
