export type TransactionType = "CREDIT" | "DEBIT" | "TRANSFER" | "REFUND" | "WITHDRAWAL";
export type TransactionStatus = "INITIATED" | "PROCESSING" | "SUCCESS" | "FAILED" | "REVERSED";

export interface LedgerEntryResponseDto {
  id: string;
  walletId: string;
  amount: number;
  entryType: "DEBIT" | "CREDIT";
  balanceAfter: number;
  createdAt: string;
}

export interface TransactionResponseDto {
  id: string;
  referenceId: string;
  sourceWalletId?: string | null;
  targetWalletId?: string | null;
  amount: number;
  displayAmount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  failureReason?: string | null;
  createdAt: string;
  ledgerEntries?: LedgerEntryResponseDto[];
}

export type PaymentStatus = "INITIATED" | "PROCESSING" | "SUCCESS" | "FAILED";
export type PaymentMethod = "WALLET" | "MOCK_GATEWAY" | "CARD" | "UPI";

export interface CreatePaymentRequest {
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  description?: string;
}

export interface PaymentResponseDto {
  id: string;
  paymentReference: string;
  userId: string;
  walletId: string;
  amount: number;
  displayAmount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  gatewayTransactionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type RefundStatus = "INITIATED" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface CreateRefundRequest {
  paymentReference: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponseDto {
  id: string;
  refundReference: string;
  paymentId: string;
  amount: number;
  displayAmount: number;
  currency: string;
  status: RefundStatus;
  reason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  channel: string;
  recipient: string;
  subject?: string;
  content: string;
  status: string;
  referenceId?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  details?: string;
  timestamp: string;
}
