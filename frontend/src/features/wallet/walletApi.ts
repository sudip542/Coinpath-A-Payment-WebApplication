import { apiClient, idempotentPost } from "@/services/apiClient";
import { API_ROUTES } from "@/services/apiRoutes";
import { mockApi, isMockMode } from "@/services/mockApi";
import type { ApiResponse } from "@/types/api";
import type {
  WalletResponseDto,
  WalletBalanceDto,
  DepositRequest,
  TransferRequest,
  WithdrawRequest,
  UpdateWalletStatusRequest,
} from "@/types/wallet";
import type { TransactionResponseDto } from "@/types/transaction";

export const walletApi = {
  async getWallet(): Promise<ApiResponse<WalletResponseDto>> {
    if (isMockMode()) {
      return mockApi.getWallet();
    }
    const response = await apiClient.get<ApiResponse<WalletResponseDto>>(API_ROUTES.WALLET);
    return response.data;
  },

  async getBalance(): Promise<ApiResponse<WalletBalanceDto>> {
    if (isMockMode()) {
      return mockApi.getBalance();
    }
    const response = await apiClient.get<ApiResponse<WalletBalanceDto>>(API_ROUTES.WALLET_BALANCE);
    return response.data;
  },

  async addMoney(
    request: DepositRequest,
    idempotencyKey: string
  ): Promise<ApiResponse<TransactionResponseDto>> {
    if (isMockMode()) {
      return mockApi.addMoney(request);
    }
    return idempotentPost<ApiResponse<TransactionResponseDto>, DepositRequest>(
      API_ROUTES.WALLET_ADD_MONEY,
      request,
      idempotencyKey
    );
  },

  async transfer(
    request: TransferRequest,
    idempotencyKey: string
  ): Promise<ApiResponse<TransactionResponseDto>> {
    if (isMockMode()) {
      return mockApi.transfer(request);
    }
    return idempotentPost<ApiResponse<TransactionResponseDto>, TransferRequest>(
      API_ROUTES.WALLET_TRANSFER,
      request,
      idempotencyKey
    );
  },

  async withdraw(
    request: WithdrawRequest,
    idempotencyKey: string
  ): Promise<ApiResponse<TransactionResponseDto>> {
    if (isMockMode()) {
      return mockApi.withdraw(request);
    }
    return idempotentPost<ApiResponse<TransactionResponseDto>, WithdrawRequest>(
      API_ROUTES.WALLET_WITHDRAW,
      request,
      idempotencyKey
    );
  },

  async updateWalletStatus(
    walletId: string,
    request: UpdateWalletStatusRequest
  ): Promise<ApiResponse<WalletResponseDto>> {
    const response = await apiClient.put<ApiResponse<WalletResponseDto>>(
      API_ROUTES.WALLET_ADMIN_STATUS(walletId),
      request
    );
    return response.data;
  },
};

export default walletApi;
