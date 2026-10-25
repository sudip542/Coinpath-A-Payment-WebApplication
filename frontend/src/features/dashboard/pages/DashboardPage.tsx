import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { dashboardApi } from "../dashboardApi";
import { PageHeader } from "@/components/common/PageHeader";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingSummary } from "@/components/dashboard/SpendingSummary";
import { ErrorState } from "@/components/common/ErrorState";
import { handleApiError } from "@/services/errorHandler";
import type { WalletResponseDto } from "@/types/wallet";
import type { TransactionResponseDto } from "@/types/transaction";
import { ShieldCheck, Plus, Send, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletResponseDto | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; correlationId?: string } | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [walletRes, txRes] = await Promise.all([
        dashboardApi.getWallet(),
        dashboardApi.getRecentTransactions(),
      ]);

      if (walletRes.data) {
        setWallet(walletRes.data);
      }
      if (txRes.data) {
        setTransactions(txRes.data.content || []);
      }
    } catch (err) {
      const apiErr = handleApiError(err);
      setError({ message: apiErr.message, correlationId: apiErr.correlationId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const isWalletBlocked = wallet?.status === "BLOCKED" || wallet?.status === "CLOSED";

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(" ")[0] || "User"} 👋`}
        description="Monitor real-time ledger balance, execute instant transfers, and track account inflows."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1.5" disabled={isWalletBlocked}>
              <Link to="/wallet/add-money">
                <Plus className="size-3.5" />
                Add Money
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5" disabled={isWalletBlocked}>
              <Link to="/transfers/new">
                <Send className="size-3.5" />
                Send Money
              </Link>
            </Button>
          </div>
        }
      />

      {/* Error Banner if API fails */}
      {error && (
        <ErrorState
          title="Could not load latest wallet records"
          message={error.message}
          correlationId={error.correlationId}
          onRetry={fetchDashboardData}
        />
      )}

      {/* Top Row: Balance Card and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <BalanceCard
            balance={wallet?.balance}
            currency={wallet?.currency || "INR"}
            walletStatus={wallet?.status || "ACTIVE"}
            updatedAt={wallet?.updatedAt || wallet?.createdAt}
            isLoading={isLoading}
            onRefresh={fetchDashboardData}
          />
        </div>

        <div className="flex flex-col justify-between gap-4 lg:col-span-2">
          {/* Quick Actions Bar */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quick Operations
            </h2>
            <QuickActions walletBlocked={isWalletBlocked} />
          </div>

          {/* Security Banner */}
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>
                <strong>Idempotent Protection:</strong> Every financial transaction is tracked with cryptographic unique keys preventing double deduction.
              </span>
            </div>
            <Link to="/wallet" className="font-semibold text-primary hover:underline shrink-0">
              Wallet details
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Row: Financial Charts & Spending Inflow/Outflow */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionChart currency={wallet?.currency || "INR"} />
        </div>
        <div className="lg:col-span-1">
          <SpendingSummary currency={wallet?.currency || "INR"} />
        </div>
      </div>

      {/* Bottom Row: Recent Transactions & Notifications preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={transactions} isLoading={isLoading} />
        </div>

        {/* Notifications Quick Preview */}
        <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-foreground">Recent Alerts</h3>
            </div>
            <Link to="/notifications" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-3 space-y-3 text-xs">
            <div className="rounded-lg bg-muted/30 p-2.5 border border-border/40">
              <p className="font-semibold text-foreground">Account Shield Active</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Two-factor session authentication enabled on current terminal.
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2.5 border border-border/40">
              <p className="font-semibold text-foreground">Authoritative Ledger Synced</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Wallet balance reconciles with backend double-entry ledger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
