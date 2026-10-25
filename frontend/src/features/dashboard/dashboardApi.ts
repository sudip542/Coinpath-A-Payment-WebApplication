import { apiClient } from "@/services/apiClient";
import { API_ROUTES } from "@/services/apiRoutes";
import { mockApi, isMockMode } from "@/services/mockApi";
import type { ApiResponse, Page } from "@/types/api";
import type { WalletResponseDto } from "@/types/wallet";
import type { TransactionResponseDto } from "@/types/transaction";

export const dashboardApi = {
  async getWallet(): Promise<ApiResponse<WalletResponseDto>> {
    if (isMockMode()) {
      return mockApi.getWallet();
    }
    const response = await apiClient.get<ApiResponse<WalletResponseDto>>(API_ROUTES.WALLET);
    return response.data;
  },

  async getRecentTransactions(): Promise<ApiResponse<Page<TransactionResponseDto>>> {
    if (isMockMode()) {
      return mockApi.getTransactions(0, 5);
    }
    const response = await apiClient.get<ApiResponse<Page<TransactionResponseDto>>>(
      `${API_ROUTES.TRANSACTIONS}?page=0&size=5&direction=DESC`
    );
    return response.data;
  },
};

export default dashboardApi;
