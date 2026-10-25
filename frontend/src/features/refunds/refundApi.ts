import { apiClient, idempotentPost } from "@/services/apiClient";
import { API_ROUTES } from "@/services/apiRoutes";
import { mockApi, isMockMode } from "@/services/mockApi";
import type { ApiResponse } from "@/types/api";
import type { CreateRefundRequest, RefundResponseDto } from "@/types/transaction";

export const refundApi = {
  async createRefund(
    request: CreateRefundRequest,
    idempotencyKey: string
  ): Promise<ApiResponse<RefundResponseDto>> {
    if (isMockMode()) {
      return mockApi.createRefund(request);
    }
    return idempotentPost<ApiResponse<RefundResponseDto>, CreateRefundRequest>(
      API_ROUTES.REFUNDS,
      request,
      idempotencyKey
    );
  },

  async getRefunds(): Promise<ApiResponse<RefundResponseDto[]>> {
    if (isMockMode()) {
      return mockApi.getRefunds();
    }
    const response = await apiClient.get<ApiResponse<RefundResponseDto[]>>(API_ROUTES.REFUNDS);
    return response.data;
  },

  async getRefundByReference(refundReference: string): Promise<ApiResponse<RefundResponseDto>> {
    if (isMockMode()) {
      return mockApi.getRefundByRef(refundReference);
    }
    const response = await apiClient.get<ApiResponse<RefundResponseDto>>(
      API_ROUTES.REFUND_BY_REF(refundReference)
    );
    return response.data;
  },
};

export default refundApi;
