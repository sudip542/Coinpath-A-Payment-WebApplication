import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { formatDateTime, formatRelativeTime } from "@/lib/formatDate";
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from "lucide-react";
import type { TransactionResponseDto } from "@/types/transaction";

interface TransactionTableProps {
  transactions: TransactionResponseDto[];
  isLoading?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  return (
    <div>
      {/* Desktop Table View (hidden on small screens) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-3 px-4">Transaction Ref</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {transactions.map((tx) => {
              const isCredit = tx.type === "CREDIT" || tx.type === "REFUND";
              return (
                <tr
                  key={tx.id || tx.referenceId}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                    <Link
                      to={`/transactions/${tx.referenceId}`}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {tx.referenceId}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                      <div
                        className={`flex size-6 items-center justify-center rounded-md ${
                          isCredit
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="size-3.5" />
                        ) : (
                          <ArrowUpRight className="size-3.5" />
                        )}
                      </div>
                      <span>{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <CurrencyDisplay
                      amount={tx.amount}
                      currency={tx.currency}
                      type={isCredit ? "CREDIT" : "DEBIT"}
                      size="sm"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    <div>{formatDateTime(tx.createdAt)}</div>
                    <div className="text-[10px] text-muted-foreground/70">{formatRelativeTime(tx.createdAt)}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/transactions/${tx.referenceId}`}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      <span>Details</span>
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (shown only on small screens) */}
      <div className="md:hidden space-y-3">
        {transactions.map((tx) => {
          const isCredit = tx.type === "CREDIT" || tx.type === "REFUND";
          return (
            <Link
              key={tx.id || tx.referenceId}
              to={`/transactions/${tx.referenceId}`}
              className="block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 active:scale-[0.99] shadow-2xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="font-mono text-xs font-bold text-foreground">
                  {tx.referenceId}
                </span>
                <StatusBadge status={tx.status} />
              </div>

              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-7 items-center justify-center rounded-lg ${
                      isCredit
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{tx.type}</p>
                    <p className="text-[11px] text-muted-foreground">{formatRelativeTime(tx.createdAt)}</p>
                  </div>
                </div>

                <CurrencyDisplay
                  amount={tx.amount}
                  currency={tx.currency}
                  type={isCredit ? "CREDIT" : "DEBIT"}
                  size="md"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                <span>{formatDateTime(tx.createdAt)}</span>
                <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
                  View <ChevronRight className="size-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionTable;
