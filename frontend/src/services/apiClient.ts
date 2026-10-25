import axios, { type AxiosRequestConfig } from "axios";
import {
  requestInterceptor,
  responseSuccessInterceptor,
  responseErrorInterceptor,
} from "./interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
apiClient.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

/**
 * Helper to make idempotent POST requests for financial operations (add-money, transfer, withdraw, payment, refund)
 */
export async function idempotentPost<T, B>(
  url: string,
  body: B,
  idempotencyKey: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(url, body, {
    ...config,
    headers: {
      ...config?.headers,
      "Idempotency-Key": idempotencyKey,
    },
  });
  return response.data;
}

export default apiClient;
