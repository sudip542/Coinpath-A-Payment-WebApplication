import { apiClient, idempotentPost } from "@/services/apiClient";
import { API_ROUTES } from "@/services/apiRoutes";
import { mockApi, isMockMode } from "@/services/mockApi";
import type { ApiResponse } from "@/types/api";
import type { CreatePaymentRequest, PaymentResponseDto } from "@/types/transaction";

export const paymentApi = {
  async createPayment(
    request: CreatePaymentRequest,
    idempotencyKey: string
  ): Promise<ApiResponse<PaymentResponseDto>> {
    if (isMockMode()) {
      return mockApi.createPayment(request);
    }
    return idempotentPost<ApiResponse<PaymentResponseDto>, CreatePaymentRequest>(
      API_ROUTES.PAYMENTS,
      request,
      idempotencyKey
    );
  },

  async getPayments(): Promise<ApiResponse<PaymentResponseDto[]>> {
    if (isMockMode()) {
      return mockApi.getPayments();
    }
    const response = await apiClient.get<ApiResponse<PaymentResponseDto[]>>(API_ROUTES.PAYMENTS);
    return response.data;
  },

  async getPaymentByReference(paymentReference: string): Promise<ApiResponse<PaymentResponseDto>> {
    if (isMockMode()) {
      return mockApi.getPaymentByRef(paymentReference);
    }
    const response = await apiClient.get<ApiResponse<PaymentResponseDto>>(
      API_ROUTES.PAYMENT_BY_REF(paymentReference)
    );
    return response.data;
  },
};

export default paymentApi;
