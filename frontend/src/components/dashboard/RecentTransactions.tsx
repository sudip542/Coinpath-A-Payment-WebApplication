import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatRelativeTime } from "@/lib/formatDate";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, ChevronRight, Receipt } from "lucide-react";
import type { TransactionResponseDto } from "@/types/transaction";

interface RecentTransactionsProps {
  transactions: TransactionResponseDto[];
  isLoading?: boolean;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Recent Transactions
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest digital wallet activity
          </p>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View all <ChevronRight className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Receipt className="size-8 stroke-1 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium">No transactions recorded yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add funds or make a transfer to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {transactions.slice(0, 5).map((tx) => {
              const isCredit = tx.type === "CREDIT" || tx.type === "REFUND";
              return (
                <Link
                  key={tx.id || tx.referenceId}
                  to={`/transactions/${tx.referenceId}`}
                  className="group flex items-center justify-between py-3 transition-colors hover:bg-muted/40 rounded-lg px-2 -mx-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                        isCredit
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="size-4.5" />
                      ) : (
                        <ArrowUpRight className="size-4.5" />
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {tx.type}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {tx.referenceId}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <CurrencyDisplay
                      amount={tx.amount}
                      currency={tx.currency}
                      type={isCredit ? "CREDIT" : "DEBIT"}
                      size="sm"
                    />
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <StatusBadge status={tx.status} showIcon={false} className="py-0 px-1.5 text-[10px]" />
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(tx.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
