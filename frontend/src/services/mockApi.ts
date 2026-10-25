import type { ApiResponse, Page } from "@/types/api";
import type { User, AuthResponse, LoginRequest, RegisterRequest } from "@/types/user";
import type { WalletResponseDto, WalletBalanceDto, DepositRequest, TransferRequest, WithdrawRequest } from "@/types/wallet";
import type {
  TransactionResponseDto,
  PaymentResponseDto,
  CreatePaymentRequest,
  RefundResponseDto,
  CreateRefundRequest,
  NotificationItem,
  AuditLog,
} from "@/types/transaction";
import { sleep, generateUUID } from "@/lib/utils";

export const isMockMode = (): boolean => {
  return import.meta.env.VITE_ENABLE_MOCK_API === "true";
};

// Demo User state
let mockUser: User = {
  id: "u-9843-f8a1-432a",
  email: "alex.mercer@coinpath.io",
  fullName: "Alex Mercer",
  role: "ROLE_USER",
  status: "ACTIVE",
  createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
};

// Demo Wallet state
let mockWallet: WalletResponseDto = {
  id: "w-7712-4412-9988",
  userId: "u-9843-f8a1-432a",
  balance: 48750.5,
  displayBalance: 48750.5,
  currency: "INR",
  status: "ACTIVE",
  version: 12,
  createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

// Demo Transactions
let mockTransactions: TransactionResponseDto[] = [
  {
    id: "tx-1",
    referenceId: "TXN-20261024-8901",
    sourceWalletId: null,
    targetWalletId: "w-7712-4412-9988",
    amount: 15000.0,
    displayAmount: 15000.0,
    currency: "INR",
    type: "CREDIT",
    status: "SUCCESS",
    failureReason: null,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    ledgerEntries: [
      {
        id: "le-1",
        walletId: "w-7712-4412-9988",
        amount: 15000.0,
        entryType: "CREDIT",
        balanceAfter: 48750.5,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
  },
  {
    id: "tx-2",
    referenceId: "TXN-20261023-7412",
    sourceWalletId: "w-7712-4412-9988",
    targetWalletId: "w-2234-8899-1122",
    amount: 3200.0,
    displayAmount: 3200.0,
    currency: "INR",
    type: "TRANSFER",
    status: "SUCCESS",
    failureReason: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    ledgerEntries: [
      {
        id: "le-2",
        walletId: "w-7712-4412-9988",
        amount: 3200.0,
        entryType: "DEBIT",
        balanceAfter: 33750.5,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
  {
    id: "tx-3",
    referenceId: "TXN-20261022-6321",
    sourceWalletId: "w-7712-4412-9988",
    targetWalletId: null,
    amount: 5000.0,
    displayAmount: 5000.0,
    currency: "INR",
    type: "WITHDRAWAL",
    status: "SUCCESS",
    failureReason: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    ledgerEntries: [
      {
        id: "le-3",
        walletId: "w-7712-4412-9988",
        amount: 5000.0,
        entryType: "DEBIT",
        balanceAfter: 36950.5,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
  },
  {
    id: "tx-4",
    referenceId: "TXN-20261020-5112",
    sourceWalletId: null,
    targetWalletId: "w-7712-4412-9988",
    amount: 1250.0,
    displayAmount: 1250.0,
    currency: "INR",
    type: "REFUND",
    status: "SUCCESS",
    failureReason: null,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    ledgerEntries: [],
  },
  {
    id: "tx-5",
    referenceId: "TXN-20261019-4091",
    sourceWalletId: "w-7712-4412-9988",
    targetWalletId: "w-5566-7788-9900",
    amount: 890.0,
    displayAmount: 890.0,
    currency: "INR",
    type: "DEBIT",
    status: "SUCCESS",
    failureReason: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    ledgerEntries: [],
  },
  {
    id: "tx-6",
    referenceId: "TXN-20261018-3829",
    sourceWalletId: "w-7712-4412-9988",
    targetWalletId: null,
    amount: 25000.0,
    displayAmount: 25000.0,
    currency: "INR",
    type: "TRANSFER",
    status: "FAILED",
    failureReason: "Recipient account limit exceeded",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    ledgerEntries: [],
  },
];

// Demo Payments
let mockPayments: PaymentResponseDto[] = [
  {
    id: "pay-1",
    paymentReference: "PAY-20261024-991",
    userId: "u-9843-f8a1-432a",
    walletId: "w-7712-4412-9988",
    amount: 4500.0,
    displayAmount: 4500.0,
    currency: "INR",
    status: "SUCCESS",
    paymentMethod: "CARD",
    gatewayTransactionId: "gw_tx_visa_98812",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "pay-2",
    paymentReference: "PAY-20261021-432",
    userId: "u-9843-f8a1-432a",
    walletId: "w-7712-4412-9988",
    amount: 1250.0,
    displayAmount: 1250.0,
    currency: "INR",
    status: "SUCCESS",
    paymentMethod: "UPI",
    gatewayTransactionId: "gw_upi_8837190",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// Demo Refunds
let mockRefunds: RefundResponseDto[] = [
  {
    id: "ref-1",
    refundReference: "REF-20261020-001",
    paymentId: "pay-2",
    amount: 1250.0,
    displayAmount: 1250.0,
    currency: "INR",
    status: "SUCCESS",
    reason: "Merchant cancellation requested by buyer",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

// Demo Notifications
let mockNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    userId: "u-9843-f8a1-432a",
    channel: "EMAIL",
    recipient: "alex.mercer@coinpath.io",
    subject: "Funds Deposited Successfully",
    content: "₹15,000.00 was credited to your Coinpath wallet. Reference: TXN-20261024-8901",
    status: "SENT",
    referenceId: "TXN-20261024-8901",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "notif-2",
    userId: "u-9843-f8a1-432a",
    channel: "PUSH",
    recipient: "alex.mercer@coinpath.io",
    subject: "Transfer Sent",
    content: "You sent ₹3,200.00 to sarah.connor@cyber.net.",
    status: "SENT",
    referenceId: "TXN-20261023-7412",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "notif-3",
    userId: "u-9843-f8a1-432a",
    channel: "SMS",
    recipient: "+91-9876543210",
    subject: "Security Alert: New Sign-in",
    content: "New login detected on your Coinpath account from Chrome / Windows.",
    status: "SENT",
    referenceId: "SEC-LOG-019",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// Demo Audit Logs (Admin)
let mockAuditLogs: AuditLog[] = [
  {
    id: "aud-1",
    userId: "u-9843-f8a1-432a",
    action: "WALLET_DEPOSIT",
    resourceType: "WALLET",
    resourceId: "w-7712-4412-9988",
    ipAddress: "192.168.1.45",
    details: '{"amount": 15000.00, "currency": "INR", "referenceId": "TXN-20261024-8901"}',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "aud-2",
    userId: "u-9843-f8a1-432a",
    action: "WALLET_TRANSFER",
    resourceType: "WALLET_TRANSACTION",
    resourceId: "TXN-20261023-7412",
    ipAddress: "192.168.1.45",
    details: '{"amount": 3200.00, "recipient": "sarah.connor@cyber.net"}',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "aud-3",
    userId: "u-9843-f8a1-432a",
    action: "PAYMENT_PROCESSED",
    resourceType: "PAYMENT",
    resourceId: "PAY-20261024-991",
    ipAddress: "192.168.1.45",
    details: '{"gateway": "MOCK_GATEWAY", "status": "SUCCESS"}',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export const mockApi = {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    await sleep(400);
    const isAdmin = credentials.email.includes("admin");
    const user: User = {
      ...mockUser,
      email: credentials.email,
      role: isAdmin ? "ROLE_ADMIN" : "ROLE_USER",
    };
    mockUser = user;
    return {
      success: true,
      message: "Login successful (Demo Mode)",
      data: {
        accessToken: "demo_jwt_access_token_" + generateUUID(),
        refreshToken: "demo_jwt_refresh_token_" + generateUUID(),
        tokenType: "Bearer",
        expiresInMs: 86400000,
        user,
      },
    };
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    await sleep(500);
    const user: User = {
      id: generateUUID(),
      email: data.email,
      fullName: data.fullName,
      role: "ROLE_USER",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    mockUser = user;
    return {
      success: true,
      message: "User registered successfully (Demo Mode)",
      data: {
        accessToken: "demo_jwt_access_token_" + generateUUID(),
        refreshToken: "demo_jwt_refresh_token_" + generateUUID(),
        tokenType: "Bearer",
        expiresInMs: 86400000,
        user,
      },
    };
  },

  async getWallet(): Promise<ApiResponse<WalletResponseDto>> {
    await sleep(250);
    return {
      success: true,
      message: "Wallet retrieved successfully",
      data: { ...mockWallet },
    };
  },

  async getBalance(): Promise<ApiResponse<WalletBalanceDto>> {
    await sleep(150);
    return {
      success: true,
      message: "Balance retrieved successfully",
      data: {
        walletId: mockWallet.id,
        balance: mockWallet.balance,
        displayBalance: mockWallet.displayBalance,
        currency: mockWallet.currency,
      },
    };
  },

  async addMoney(request: DepositRequest): Promise<ApiResponse<TransactionResponseDto>> {
    await sleep(600);
    const newBalance = mockWallet.balance + Number(request.amount);
    mockWallet = {
      ...mockWallet,
      balance: newBalance,
      displayBalance: newBalance,
      updatedAt: new Date().toISOString(),
    };

    const tx: TransactionResponseDto = {
      id: generateUUID(),
      referenceId: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceWalletId: null,
      targetWalletId: mockWallet.id,
      amount: Number(request.amount),
      displayAmount: Number(request.amount),
      currency: request.currency || "INR",
      type: "CREDIT",
      status: "SUCCESS",
      failureReason: null,
      createdAt: new Date().toISOString(),
      ledgerEntries: [
        {
          id: generateUUID(),
          walletId: mockWallet.id,
          amount: Number(request.amount),
          entryType: "CREDIT",
          balanceAfter: newBalance,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    mockTransactions.unshift(tx);
    return {
      success: true,
      message: "Funds added successfully (Demo Mode)",
      data: tx,
    };
  },

  async transfer(request: TransferRequest): Promise<ApiResponse<TransactionResponseDto>> {
    await sleep(700);
    const amount = Number(request.amount);
    if (mockWallet.balance < amount) {
      throw new Error("Insufficient balance for transfer");
    }

    const newBalance = mockWallet.balance - amount;
    mockWallet = {
      ...mockWallet,
      balance: newBalance,
      displayBalance: newBalance,
      updatedAt: new Date().toISOString(),
    };

    const tx: TransactionResponseDto = {
      id: generateUUID(),
      referenceId: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceWalletId: mockWallet.id,
      targetWalletId: request.targetWalletId || "w-target-demo",
      amount,
      displayAmount: amount,
      currency: request.currency || "INR",
      type: "TRANSFER",
      status: "SUCCESS",
      failureReason: null,
      createdAt: new Date().toISOString(),
      ledgerEntries: [
        {
          id: generateUUID(),
          walletId: mockWallet.id,
          amount,
          entryType: "DEBIT",
          balanceAfter: newBalance,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    mockTransactions.unshift(tx);
    return {
      success: true,
      message: "Transfer completed successfully (Demo Mode)",
      data: tx,
    };
  },

  async withdraw(request: WithdrawRequest): Promise<ApiResponse<TransactionResponseDto>> {
    await sleep(650);
    const amount = Number(request.amount);
    if (mockWallet.balance < amount) {
      throw new Error("Insufficient balance for withdrawal");
    }

    const newBalance = mockWallet.balance - amount;
    mockWallet = {
      ...mockWallet,
      balance: newBalance,
      displayBalance: newBalance,
      updatedAt: new Date().toISOString(),
    };

    const tx: TransactionResponseDto = {
      id: generateUUID(),
      referenceId: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceWalletId: mockWallet.id,
      targetWalletId: null,
      amount,
      displayAmount: amount,
      currency: request.currency || "INR",
      type: "WITHDRAWAL",
      status: "SUCCESS",
      failureReason: null,
      createdAt: new Date().toISOString(),
      ledgerEntries: [
        {
          id: generateUUID(),
          walletId: mockWallet.id,
          amount,
          entryType: "DEBIT",
          balanceAfter: newBalance,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    mockTransactions.unshift(tx);
    return {
      success: true,
      message: "Withdrawal completed successfully (Demo Mode)",
      data: tx,
    };
  },

  async getTransactions(page: number = 0, size: number = 20): Promise<ApiResponse<Page<TransactionResponseDto>>> {
    await sleep(250);
    const start = page * size;
    const paginated = mockTransactions.slice(start, start + size);
    return {
      success: true,
      message: "Transactions retrieved successfully",
      data: {
        content: paginated,
        totalElements: mockTransactions.length,
        totalPages: Math.ceil(mockTransactions.length / size),
        last: start + size >= mockTransactions.length,
        size,
        number: page,
        first: page === 0,
        empty: mockTransactions.length === 0,
      },
    };
  },

  async getTransactionByRef(ref: string): Promise<ApiResponse<TransactionResponseDto>> {
    await sleep(200);
    const found = mockTransactions.find((t) => t.referenceId === ref || t.id === ref);
    if (!found) {
      throw new Error("Transaction not found: " + ref);
    }
    return {
      success: true,
      message: "Transaction details retrieved successfully",
      data: found,
    };
  },

  async createPayment(request: CreatePaymentRequest): Promise<ApiResponse<PaymentResponseDto>> {
    await sleep(600);
    const payment: PaymentResponseDto = {
      id: generateUUID(),
      paymentReference: `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
      userId: mockUser.id,
      walletId: mockWallet.id,
      amount: Number(request.amount),
      displayAmount: Number(request.amount),
      currency: request.currency || "INR",
      status: "SUCCESS",
      paymentMethod: request.paymentMethod,
      gatewayTransactionId: "gw_demo_" + generateUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPayments.unshift(payment);
    return {
      success: true,
      message: "Payment processed successfully (Demo Mode)",
      data: payment,
    };
  },

  async getPayments(): Promise<ApiResponse<PaymentResponseDto[]>> {
    await sleep(200);
    return {
      success: true,
      message: "Payments retrieved successfully",
      data: [...mockPayments],
    };
  },

  async getPaymentByRef(ref: string): Promise<ApiResponse<PaymentResponseDto>> {
    await sleep(200);
    const found = mockPayments.find((p) => p.paymentReference === ref || p.id === ref);
    if (!found) {
      throw new Error("Payment not found: " + ref);
    }
    return {
      success: true,
      message: "Payment details retrieved successfully",
      data: found,
    };
  },

  async createRefund(request: CreateRefundRequest): Promise<ApiResponse<RefundResponseDto>> {
    await sleep(600);
    const refund: RefundResponseDto = {
      id: generateUUID(),
      refundReference: `REF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
      paymentId: request.paymentReference,
      amount: request.amount || 1000,
      displayAmount: request.amount || 1000,
      currency: "INR",
      status: "SUCCESS",
      reason: request.reason || "Customer initiated refund",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockRefunds.unshift(refund);
    return {
      success: true,
      message: "Refund processed successfully (Demo Mode)",
      data: refund,
    };
  },

  async getRefunds(): Promise<ApiResponse<RefundResponseDto[]>> {
    await sleep(200);
    return {
      success: true,
      message: "Refunds retrieved successfully",
      data: [...mockRefunds],
    };
  },

  async getRefundByRef(ref: string): Promise<ApiResponse<RefundResponseDto>> {
    await sleep(200);
    const found = mockRefunds.find((r) => r.refundReference === ref || r.id === ref);
    if (!found) {
      throw new Error("Refund not found: " + ref);
    }
    return {
      success: true,
      message: "Refund details retrieved successfully",
      data: found,
    };
  },

  async getNotifications(page: number = 0, size: number = 20): Promise<Page<NotificationItem>> {
    await sleep(200);
    const start = page * size;
    const paginated = mockNotifications.slice(start, start + size);
    return {
      content: paginated,
      totalElements: mockNotifications.length,
      totalPages: Math.ceil(mockNotifications.length / size),
      last: start + size >= mockNotifications.length,
      size,
      number: page,
      first: page === 0,
      empty: mockNotifications.length === 0,
    };
  },

  async getAuditLogs(page: number = 0, size: number = 20): Promise<Page<AuditLog>> {
    await sleep(250);
    const start = page * size;
    const paginated = mockAuditLogs.slice(start, start + size);
    return {
      content: paginated,
      totalElements: mockAuditLogs.length,
      totalPages: Math.ceil(mockAuditLogs.length / size),
      last: start + size >= mockAuditLogs.length,
      size,
      number: page,
      first: page === 0,
      empty: mockAuditLogs.length === 0,
    };
  },
};
