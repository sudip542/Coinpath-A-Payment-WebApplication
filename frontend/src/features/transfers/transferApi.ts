import { walletApi } from "@/features/wallet/walletApi";
import type { ApiResponse } from "@/types/api";
import type { TransferRequest } from "@/types/wallet";
import type { TransactionResponseDto } from "@/types/transaction";

export const transferApi = {
  async executeTransfer(
    request: TransferRequest,
    idempotencyKey: string
  ): Promise<ApiResponse<TransactionResponseDto>> {
    return walletApi.transfer(request, idempotencyKey);
  },
};

export default transferApi;
