import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatRelativeTime } from "@/lib/formatDate";
import { Eye, EyeOff, Wallet, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceCardProps {
  balance: number | null | undefined;
  currency?: string;
  walletStatus?: string;
  updatedAt?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  currency = "INR",
  walletStatus = "ACTIVE",
  updatedAt,
  isLoading = false,
  onRefresh,
}) => {
  const [hideBalance, setHideBalance] = useState(false);

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-gradient-to-br from-card via-card to-muted/20 shadow-xs">
        <CardContent className="p-6">
          <div className="flex items-center justify-between pb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-48 my-2" />
          <div className="flex items-center justify-between pt-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-indigo-500/5 shadow-xs transition-shadow hover:shadow-md">
      {/* Decorative accent background subtle circle */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-indigo-500/10 blur-2xl" />

      <CardContent className="p-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="size-4" />
            </div>
            <span>Available Balance</span>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={walletStatus} />
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label={hideBalance ? "Show balance" : "Hide balance"}
              title={hideBalance ? "Show balance" : "Hide balance"}
            >
              {hideBalance ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Refresh balance"
                title="Refresh authoritative balance"
              >
                <RefreshCw className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Balance Display */}
        <div className="my-4">
          <CurrencyDisplay
            amount={balance ?? 0}
            currency={currency}
            hidden={hideBalance}
            size="2xl"
          />
        </div>

        {/* Footer info: updated timestamp & status */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Authoritative Ledger Balance</span>
          </div>

          {updatedAt && (
            <div className="font-mono text-[11px]">
              Synced {formatRelativeTime(updatedAt)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
