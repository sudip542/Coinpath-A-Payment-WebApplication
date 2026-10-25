/**
 * Centralized API route definitions matching Spring Boot RestControllers
 */
export const API_ROUTES = {
  // Auth
  AUTH_REGISTER: "/api/auth/register",
  AUTH_LOGIN: "/api/auth/login",

  // Wallet
  WALLET: "/api/wallet",
  WALLET_BALANCE: "/api/wallet/balance",
  WALLET_ADD_MONEY: "/api/wallet/add-money",
  WALLET_TRANSFER: "/api/wallet/transfer",
  WALLET_WITHDRAW: "/api/wallet/withdraw",
  WALLET_ADMIN_STATUS: (walletId: string) => `/api/wallet/admin/${walletId}/status`,

  // Transactions
  TRANSACTIONS: "/api/transactions",
  TRANSACTION_BY_REF: (referenceId: string) => `/api/transactions/${referenceId}`,

  // Payments
  PAYMENTS: "/api/payments",
  PAYMENT_BY_REF: (paymentReference: string) => `/api/payments/${paymentReference}`,

  // Refunds
  REFUNDS: "/api/refunds",
  REFUND_BY_REF: (refundReference: string) => `/api/refunds/${refundReference}`,

  // Notifications
  NOTIFICATIONS: "/api/notifications",

  // Admin Audit Logs
  ADMIN_AUDIT_LOGS: "/api/admin/audit-logs",
} as const;
