import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";

interface SpendingSummaryProps {
  totalInflow?: number;
  totalOutflow?: number;
  currency?: string;
  className?: string;
}

export const SpendingSummary: React.FC<SpendingSummaryProps> = ({
  totalInflow = 24250,
  totalOutflow = 12090,
  currency = "INR",
  className,
}) => {
  const net = totalInflow - totalOutflow;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-foreground">
          Monthly Financial Summary
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Overview of ledger activities this calendar month
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total Inflow */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="size-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Inflow</p>
              <p className="text-sm font-bold text-foreground">Deposits & Credits</p>
            </div>
          </div>
          <CurrencyDisplay amount={totalInflow} currency={currency} type="CREDIT" size="sm" />
        </div>

        {/* Total Outflow */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ArrowUpRight className="size-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Outflow</p>
              <p className="text-sm font-bold text-foreground">Transfers & Withdrawals</p>
            </div>
          </div>
          <CurrencyDisplay amount={totalOutflow} currency={currency} type="DEBIT" size="sm" />
        </div>

        {/* Net Flow */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <TrendingUp className="size-4 text-emerald-500" />
            <span>Net Monthly Balance Change</span>
          </div>
          <CurrencyDisplay
            amount={net}
            currency={currency}
            type={net >= 0 ? "CREDIT" : "DEBIT"}
            size="md"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingSummary;
