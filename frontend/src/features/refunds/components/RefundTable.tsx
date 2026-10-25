import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { formatDateTime, formatRelativeTime } from "@/lib/formatDate";
import { ChevronRight, RotateCcw } from "lucide-react";
import type { RefundResponseDto } from "@/types/transaction";

interface RefundTableProps {
  refunds: RefundResponseDto[];
}

export const RefundTable: React.FC<RefundTableProps> = ({ refunds }) => {
  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-3 px-4">Refund Ref</th>
              <th className="py-3 px-4">Payment Ref</th>
              <th className="py-3 px-4">Refund Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {refunds.map((r) => (
              <tr key={r.id || r.refundReference} className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                  <Link
                    to={`/refunds/${r.refundReference}`}
                    className="hover:text-primary hover:underline transition-colors"
                  >
                    {r.refundReference}
                  </Link>
                </td>
                <td className="py-3.5 px-4 font-mono text-muted-foreground">
                  <Link
                    to={`/payments/${r.paymentId}`}
                    className="hover:text-primary hover:underline"
                  >
                    {r.paymentId}
                  </Link>
                </td>
                <td className="py-3.5 px-4">
                  <CurrencyDisplay amount={r.amount} currency={r.currency} type="CREDIT" size="sm" />
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="py-3.5 px-4 text-muted-foreground max-w-[200px] truncate">
                  {r.reason || "Standard refund"}
                </td>
                <td className="py-3.5 px-4 text-muted-foreground">
                  <div>{formatDateTime(r.createdAt)}</div>
                  <div className="text-[10px]">{formatRelativeTime(r.createdAt)}</div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    to={`/refunds/${r.refundReference}`}
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
        {refunds.map((r) => (
          <Link
            key={r.id || r.refundReference}
            to={`/refunds/${r.refundReference}`}
            className="block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="font-mono text-xs font-bold text-foreground">
                {r.refundReference}
              </span>
              <StatusBadge status={r.status} />
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <RotateCcw className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground font-mono">{r.paymentId}</p>
                  <p className="text-[11px] text-muted-foreground">{formatRelativeTime(r.createdAt)}</p>
                </div>
              </div>
              <CurrencyDisplay amount={r.amount} currency={r.currency} type="CREDIT" size="md" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
              <span className="truncate max-w-[200px]">{r.reason || "Customer refund"}</span>
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

export default RefundTable;
