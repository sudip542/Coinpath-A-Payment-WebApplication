import { AxiosError } from "axios";
import type { ApiError, ApiResponse } from "@/types/api";

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const responseData = error.response?.data as ApiResponse<unknown> | undefined;
    const correlationId = (error.response?.headers?.["x-correlation-id"] ||
      error.config?.headers?.["X-Correlation-ID"]) as string | undefined;

    // Backend returned structured ApiResponse error envelope
    if (responseData && typeof responseData === "object") {
      return {
        message: responseData.message || error.message || "An unexpected error occurred",
        errorCode: responseData.errorCode || undefined,
        status,
        correlationId,
      };
    }

    if (status === 401) {
      return {
        message: "Your session has expired or authentication failed. Please sign in again.",
        errorCode: "UNAUTHORIZED",
        status: 401,
        correlationId,
      };
    }

    if (status === 403) {
      return {
        message: "You do not have permission to perform this action.",
        errorCode: "FORBIDDEN",
        status: 403,
        correlationId,
      };
    }

    if (status === 404) {
      return {
        message: "The requested resource could not be found.",
        errorCode: "NOT_FOUND",
        status: 404,
        correlationId,
      };
    }

    if (status === 429) {
      return {
        message: "Rate limit exceeded. Please wait a moment before trying again.",
        errorCode: "RATE_LIMITED",
        status: 429,
        correlationId,
      };
    }

    if (!error.response) {
      return {
        message: "Unable to connect to Coinpath servers. Check your network or verify the backend is running.",
        errorCode: "NETWORK_ERROR",
        correlationId,
      };
    }

    return {
      message: error.message || "Request failed",
      status,
      correlationId,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "An unknown error occurred while processing your request.",
  };
}
