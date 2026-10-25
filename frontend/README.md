# Coinpath Frontend — Fintech Digital Wallet & Payment Management Platform

Coinpath is a production-quality, responsive fintech digital wallet and payment management web application. It connects with a Spring Boot 3.x backend (PostgreSQL, Redis, Kafka, Spring Security with JWT authentication) while offering an isolated and explicit Demo Mode for standalone evaluation and testing.

---

## 🚀 Key Features

- **Authoritative Balance & Multi-Currency Ledger:** Real-time wallet balance display with privacy show/hide toggle, optimistic lock versioning, and double-entry ledger reconciliation.
- **Idempotent Financial Operations:**
  - **Add Money:** Deposits with instant gateway simulation and strict `Idempotency-Key` generation/retention on retry.
  - **Send Money:** Atomic wallet-to-wallet transfers via email address or wallet UUID with balance guardrails.
  - **Withdraw Money:** Direct disbursement to linked bank accounts or UPI VPAs.
- **Transaction History & Ledger Inspection:** Filterable, paginated transaction table with mobile card fallback, status indicators (SUCCESS, PROCESSING, FAILED, REVERSED), and deep inspection of cryptographic ledger entries.
- **Payment Gateway & Checkout:** Checkout initiation, gateway reference inspection, and status tracking.
- **Refund Management:** Partial and full payment refund initiation linked back to parent payments.
- **Security & RBAC:** Role-Based Access Control (`ROLE_USER` and `ROLE_ADMIN`), protected routing, and X-Correlation-ID tracing across requests.
- **Admin Control Center & Audit Trail:** Exclusive administrator dashboard featuring system telemetry and immutable audit logs.
- **Fintech Design System:** Tailored deep indigo and emerald color palette, subtle micro-interactions, responsive charts with Recharts, and dark/light mode toggle.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **State Management:** Redux Toolkit + React Redux
- **Routing:** React Router DOM (v7/v8) with Route Guards
- **Styling:** Tailwind CSS + OKLCH Design Tokens + shadcn/ui components (`@base-ui/react`)
- **Icons:** Lucide React
- **Forms & Validation:** React Hook Form + Zod
- **Charts:** Recharts
- **HTTP Client:** Axios with Request/Response Interceptors & Correlation ID propagation
- **Notifications:** Sonner Toast Notifications
- **Date Formatting:** date-fns

---

## 📁 Directory Structure

```text
frontend/
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── assets/
│   ├── components/
│   │   ├── ui/                    # Reusable shadcn/ui primitives
│   │   ├── common/                # AppLogo, PageHeader, LoadingSpinner, EmptyState, ErrorState, ConfirmDialog, StatusBadge, CurrencyDisplay
│   │   ├── layout/                # AppLayout, Sidebar, MobileSidebar, Topbar, Breadcrumbs, UserMenu
│   │   ├── dashboard/             # BalanceCard, QuickActions, TransactionChart, RecentTransactions, SpendingSummary
│   │   └── forms/                 # AmountInput, FormField, SubmitButton
│   ├── features/
│   │   ├── auth/                  # LoginPage, RegisterPage, LoginForm, RegisterForm, authSlice, authApi, authSchemas
│   │   ├── dashboard/             # DashboardPage, dashboardApi, dashboardTypes
│   │   ├── wallet/                # WalletPage, AddMoneyPage, WithdrawPage, AddMoneyForm, WithdrawForm, walletApi
│   │   ├── transfers/             # SendMoneyPage, TransferForm, transferApi
│   │   ├── transactions/          # TransactionsPage, TransactionDetailPage, TransactionTable, transactionApi
│   │   ├── payments/              # PaymentsPage, PaymentDetailPage, PaymentTable, paymentApi
│   │   ├── refunds/               # RefundsPage, RefundDetailPage, RefundTable, refundApi
│   │   ├── notifications/         # NotificationsPage, notificationApi
│   │   ├── profile/               # SettingsPage, ProfileCard, SecurityCard
│   │   └── admin/                 # AdminDashboardPage, AdminAuditLogsPage, AuditLogTable
│   ├── services/
│   │   ├── apiClient.ts           # Centralized Axios client with Idempotency helpers
│   │   ├── apiRoutes.ts           # REST API route mappings
│   │   ├── interceptors.ts        # JWT Bearer injection & X-Correlation-ID generator
│   │   ├── errorHandler.ts        # ApiResponse error mapper & diagnostics
│   │   └── mockApi.ts             # Dedicated demo state & simulation engine
│   ├── store/
│   │   ├── index.ts               # Redux store configuration
│   │   ├── hooks.ts               # Typed useAppDispatch & useAppSelector
│   │   ├── rootReducer.ts         # Combined root reducer
│   │   └── slices/
│   │       └── uiSlice.ts         # Theme, sidebar, and demo mode toggle
│   ├── hooks/                     # useAuth, useDebounce, useMediaQuery
│   ├── lib/                       # utils, formatCurrency, formatDate, constants
│   ├── types/                     # api, user, wallet, transaction
│   ├── styles/                    # globals.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── components.json
├── index.html
├── package.json
└── vite.config.ts
```

---

## ⚙️ Environment Configuration

Create a `.env` file from `.env.example`:

```env
# Backend Base URL (Spring Boot server default)
VITE_API_BASE_URL=http://localhost:8080

# Mock Mode Toggle (true for standalone demo, false for live backend)
VITE_ENABLE_MOCK_API=true
```

- When `VITE_ENABLE_MOCK_API=true`: The application runs in **DEMO MODE** using realistic simulated balances, transactions, and mutations. A banner informs the user that demo mode is active.
- When `VITE_ENABLE_MOCK_API=false`: The application communicates directly with the Spring Boot backend (`http://localhost:8080`).

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### 3. Production Build & Typecheck
```bash
npm run build
```

---

## 🔐 Demo Credentials

When evaluating in **Demo Mode**, quick-fill buttons are provided on the login page:

- **Standard User:** `alex.mercer@coinpath.io` / `SecureP@ss123`
- **Administrator:** `admin.system@coinpath.io` / `Admin@12345` (Unlocks Admin Dashboard & Audit Logs)

---

## 🛡️ Financial Integrity & Idempotency

- Every financial mutation (Add Money, Send Money, Withdraw, Checkout, Refund) generates a unique `Idempotency-Key` (e.g., `cp_dep_uuid`).
- If an operation encounters a network error or timeout, the user is permitted to retry **reusing the identical idempotency key**, guaranteeing that the backend ledger prevents double-charging.
- Authoritative balances are never optimistically assumed; balances sync directly from the backend response envelope upon successful settlement.
