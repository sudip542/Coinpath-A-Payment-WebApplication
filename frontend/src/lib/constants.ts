export const APP_NAME = "Coinpath";
export const APP_TAGLINE = "Fintech Digital Wallet & Payment Platform";

export const DEFAULT_CURRENCY = "INR";
export const MIN_TRANSACTION_AMOUNT = 0.01;
export const MAX_TRANSACTION_AMOUNT = 1000000;

export const ROUTES = {
  // Public
  LOGIN: "/login",
  REGISTER: "/register",

  // Core authenticated
  DASHBOARD: "/dashboard",
  WALLET: "/wallet",
  ADD_MONEY: "/wallet/add-money",
  WITHDRAW: "/wallet/withdraw",
  SEND_MONEY: "/transfers/new",
  TRANSACTIONS: "/transactions",
  TRANSACTION_DETAIL: "/transactions/:reference",
  PAYMENTS: "/payments",
  PAYMENT_DETAIL: "/payments/:reference",
  REFUNDS: "/refunds",
  REFUND_DETAIL: "/refunds/:reference",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",

  // Admin
  ADMIN: "/admin",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
} as const;

export const TRANSACTION_STATUS = {
  INITIATED: "INITIATED",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REVERSED: "REVERSED",
} as const;

export const TRANSACTION_TYPE = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
  TRANSFER: "TRANSFER",
  REFUND: "REFUND",
  WITHDRAWAL: "WITHDRAWAL",
} as const;

export const WALLET_STATUS = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  CLOSED: "CLOSED",
} as const;

export const PAYMENT_STATUS = {
  INITIATED: "INITIATED",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const;

export const PAYMENT_METHODS = [
  { value: "MOCK_GATEWAY", label: "Instant Bank Gateway (Fastest)" },
  { value: "CARD", label: "Credit / Debit Card" },
  { value: "UPI", label: "UPI (Unified Payments Interface)" },
  { value: "WALLET", label: "Wallet Direct" },
] as const;

export const WITHDRAWAL_METHODS = [
  { value: "BANK_ACCOUNT", label: "Linked Bank Account (IMPS/NEFT)" },
  { value: "UPI_ID", label: "UPI ID / VPA" },
] as const;
