import { apiClient } from "@/services/apiClient";
import { API_ROUTES } from "@/services/apiRoutes";
import { mockApi, isMockMode } from "@/services/mockApi";
import type { ApiResponse, Page } from "@/types/api";
import type { TransactionResponseDto } from "@/types/transaction";

export const transactionApi = {
  async getTransactions(
    page: number = 0,
    size: number = 20,
    direction: "ASC" | "DESC" = "DESC"
  ): Promise<ApiResponse<Page<TransactionResponseDto>>> {
    if (isMockMode()) {
      return mockApi.getTransactions(page, size);
    }
    const response = await apiClient.get<ApiResponse<Page<TransactionResponseDto>>>(
      `${API_ROUTES.TRANSACTIONS}?page=${page}&size=${size}&direction=${direction}`
    );
    return response.data;
  },

  async getTransactionByReference(
    referenceId: string
  ): Promise<ApiResponse<TransactionResponseDto>> {
    if (isMockMode()) {
      return mockApi.getTransactionByRef(referenceId);
    }
    const response = await apiClient.get<ApiResponse<TransactionResponseDto>>(
      API_ROUTES.TRANSACTION_BY_REF(referenceId)
    );
    return response.data;
  },
};

export default transactionApi;
