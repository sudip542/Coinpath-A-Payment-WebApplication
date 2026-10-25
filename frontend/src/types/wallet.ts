export type WalletStatus = "ACTIVE" | "BLOCKED" | "CLOSED";

export interface WalletResponseDto {
  id: string;
  userId: string;
  balance: number;
  displayBalance: number;
  currency: string;
  status: WalletStatus;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletBalanceDto {
  walletId: string;
  balance: number;
  displayBalance: number;
  currency: string;
}

export interface DepositRequest {
  amount: number;
  currency?: string;
  paymentMethod?: string;
  description?: string;
}

export interface TransferRequest {
  recipientEmail?: string;
  targetWalletId?: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface WithdrawRequest {
  amount: number;
  currency?: string;
  destinationAccount?: string;
  withdrawalMethod?: string;
  description?: string;
}

export interface UpdateWalletStatusRequest {
  status: WalletStatus;
}
