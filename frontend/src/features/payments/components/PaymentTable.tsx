import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { formatDateTime, formatRelativeTime } from "@/lib/formatDate";
import { ChevronRight, CreditCard } from "lucide-react";
import type { PaymentResponseDto } from "@/types/transaction";

interface PaymentTableProps {
  payments: PaymentResponseDto[];
}

export const PaymentTable: React.FC<PaymentTableProps> = ({ payments }) => {
  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-3 px-4">Payment Ref</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Gateway TX ID</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {payments.map((p) => (
              <tr key={p.id || p.paymentReference} className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                  <Link
                    to={`/payments/${p.paymentReference}`}
                    className="hover:text-primary hover:underline transition-colors"
                  >
                    {p.paymentReference}
                  </Link>
                </td>
                <td className="py-3.5 px-4 font-semibold text-foreground">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px]">
                    {p.paymentMethod}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <CurrencyDisplay amount={p.amount} currency={p.currency} size="sm" />
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={p.status} />
                </td>
                <td className="py-3.5 px-4 font-mono text-muted-foreground">
                  {p.gatewayTransactionId || "—"}
                </td>
                <td className="py-3.5 px-4 text-muted-foreground">
                  <div>{formatDateTime(p.createdAt)}</div>
                  <div className="text-[10px]">{formatRelativeTime(p.createdAt)}</div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    to={`/payments/${p.paymentReference}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <span>View</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {payments.map((p) => (
          <Link
            key={p.id || p.paymentReference}
            to={`/payments/${p.paymentReference}`}
            className="block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="font-mono text-xs font-bold text-foreground">
                {p.paymentReference}
              </span>
              <StatusBadge status={p.status} />
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <CreditCard className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{p.paymentMethod}</p>
                  <p className="text-[11px] text-muted-foreground">{formatRelativeTime(p.createdAt)}</p>
                </div>
              </div>
              <CurrencyDisplay amount={p.amount} currency={p.currency} size="md" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
              <span className="font-mono">{p.gatewayTransactionId || "Instant Gateway"}</span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
                Details <ChevronRight className="size-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PaymentTable;
