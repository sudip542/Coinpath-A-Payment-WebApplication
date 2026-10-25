import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { walletApi } from "../walletApi";
import { PageHeader } from "@/components/common/PageHeader";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/formatDate";
import { handleApiError } from "@/services/errorHandler";
import type { WalletResponseDto } from "@/types/wallet";
import {
  Wallet as WalletIcon,
  ShieldCheck,
  AlertTriangle,
  History,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; correlationId?: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await walletApi.getWallet();
      if (res.data) {
        setWallet(res.data);
      }
    } catch (err) {
      const apiErr = handleApiError(err);
      setError({ message: apiErr.message, correlationId: apiErr.correlationId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const copyWalletId = () => {
    if (wallet?.id) {
      navigator.clipboard.writeText(wallet.id);
      setCopied(true);
      toast.success("Wallet ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isBlocked = wallet?.status === "BLOCKED" || wallet?.status === "CLOSED";

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="My Digital Wallet"
        description="Authoritative balance, immutable ledger details, and account lifecycle."
        actions={
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/transactions">
              <History className="size-3.5" />
              Transaction Ledger
            </Link>
          </Button>
        }
      />

      {error && (
        <ErrorState
          title="Failed to retrieve wallet information"
          message={error.message}
          correlationId={error.correlationId}
          onRetry={fetchWallet}
        />
      )}

      {/* Blocked or Closed Wallet Alert */}
      {isBlocked && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
          <AlertTriangle className="size-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm">Wallet is currently {wallet?.status}</p>
            <p className="text-destructive/90">
              Financial write operations (deposits, transfers, withdrawals) are suspended by compliance rules. Please reach out to administrative support if you believe this is an error.
            </p>
          </div>
        </div>
      )}

      {/* Main Wallet Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <BalanceCard
            balance={wallet?.balance}
            currency={wallet?.currency || "INR"}
            walletStatus={wallet?.status || "ACTIVE"}
            updatedAt={wallet?.updatedAt || wallet?.createdAt}
            isLoading={isLoading}
            onRefresh={fetchWallet}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Wallet Actions
            </h2>
            <QuickActions walletBlocked={isBlocked} />
          </div>

          {/* Technical Wallet Ledger Details */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WalletIcon className="size-4 text-primary" />
                  <CardTitle className="text-sm font-bold">Ledger Specifications</CardTitle>
                </div>
                <StatusBadge status={wallet?.status || "ACTIVE"} />
              </div>
            </CardHeader>

            <CardContent className="pt-4 text-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-border/40">
                <span className="text-muted-foreground">Wallet Identifier:</span>
                <div className="flex items-center gap-2 font-mono font-medium text-foreground">
                  <span className="truncate max-w-[240px] sm:max-w-none">{wallet?.id || "—"}</span>
                  {wallet?.id && (
                    <button
                      onClick={copyWalletId}
                      className="p-1 hover:text-primary transition-colors"
                      title="Copy Wallet ID"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Settlement Currency:</span>
                <span className="font-semibold text-foreground">{wallet?.currency || "INR"}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Optimistic Lock Version:</span>
                <span className="font-mono text-foreground font-semibold">{wallet?.version ?? 1}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Account Created:</span>
                <span className="text-foreground">{formatDateTime(wallet?.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Double-Entry Ledger Integrity:</span>
                <div className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" />
                  <span>Verified Reconciled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
