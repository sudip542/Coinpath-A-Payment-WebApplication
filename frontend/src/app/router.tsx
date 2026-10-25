import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";

// Auth Pages
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";

// Financial Core Pages
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { WalletPage } from "@/features/wallet/pages/WalletPage";
import { AddMoneyPage } from "@/features/wallet/pages/AddMoneyPage";
import { WithdrawPage } from "@/features/wallet/pages/WithdrawPage";
import { SendMoneyPage } from "@/features/transfers/pages/SendMoneyPage";

// Ledger, Payments, Refunds
import { TransactionsPage } from "@/features/transactions/pages/TransactionsPage";
import { TransactionDetailPage } from "@/features/transactions/pages/TransactionDetailPage";
import { PaymentsPage } from "@/features/payments/pages/PaymentsPage";
import { PaymentDetailPage } from "@/features/payments/pages/PaymentDetailPage";
import { RefundsPage } from "@/features/refunds/pages/RefundsPage";
import { RefundDetailPage } from "@/features/refunds/pages/RefundDetailPage";

// Notifications & Profile
import { NotificationsPage } from "@/features/notifications/pages/NotificationsPage";
import { SettingsPage } from "@/features/profile/pages/SettingsPage";

// Admin
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { AdminAuditLogsPage } from "@/features/admin/pages/AdminAuditLogsPage";

/**
 * Route Guard for authenticated pages
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

/**
 * Route Guard for public-only pages (login/register)
 */
const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

/**
 * Role-based guard for ADMIN-only pages
 */
const AdminRoute: React.FC = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  // Authenticated App Shell
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },

          // Wallet
          { path: "/wallet", element: <WalletPage /> },
          { path: "/wallet/add-money", element: <AddMoneyPage /> },
          { path: "/wallet/withdraw", element: <WithdrawPage /> },

          // Transfers
          { path: "/transfers/new", element: <SendMoneyPage /> },

          // Transactions
          { path: "/transactions", element: <TransactionsPage /> },
          { path: "/transactions/:reference", element: <TransactionDetailPage /> },

          // Payments
          { path: "/payments", element: <PaymentsPage /> },
          { path: "/payments/:reference", element: <PaymentDetailPage /> },

          // Refunds
          { path: "/refunds", element: <RefundsPage /> },
          { path: "/refunds/:reference", element: <RefundDetailPage /> },

          // Notifications & Settings
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/settings", element: <SettingsPage /> },

          // Admin Protected Routes
          {
            element: <AdminRoute />,
            children: [
              { path: "/admin", element: <AdminDashboardPage /> },
              { path: "/admin/audit-logs", element: <AdminAuditLogsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Fallback catch-all redirect
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
