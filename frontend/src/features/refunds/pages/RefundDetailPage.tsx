import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { refundApi } from "../refundApi";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatDate";
import { handleApiError } from "@/services/errorHandler";
import type { RefundResponseDto } from "@/types/transaction";
import { ChevronLeft, RotateCcw } from "lucide-react";

export const RefundDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [refund, setRefund] = useState<RefundResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; correlationId?: string } | null>(null);

  useEffect(() => {
    if (!reference) return;

    setIsLoading(true);
    refundApi
      .getRefundByReference(reference)
      .then((res) => {
        if (res.data) setRefund(res.data);
      })
      .catch((err) => {
        const apiErr = handleApiError(err);
        setError({ message: apiErr.message, correlationId: apiErr.correlationId });
      })
      .finally(() => setIsLoading(false));
  }, [reference]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <LoadingSpinner text="Retrieving refund details..." size="lg" />
      </div>
    );
  }

  if (error || !refund) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          to="/refunds"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back to Refunds
        </Link>
        <ErrorState
          title="Refund Record Not Found"
          message={error?.message || "Could not find refund details"}
          correlationId={error?.correlationId}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in-50 duration-200">
      <Link
        to="/refunds"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-3.5" />
        Back to Refunds
      </Link>

      <PageHeader
        title={`Refund ${refund.refundReference}`}
        description="Reversal ledger record and original payment linkage."
        badge={<StatusBadge status={refund.status} />}
      />

      <Card className="border-border/80 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between pb-6 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <RotateCcw className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Refund Credited</p>
                <CurrencyDisplay amount={refund.amount} currency={refund.currency} type="CREDIT" size="xl" />
              </div>
            </div>
            <StatusBadge status={refund.status} />
          </div>

          <div className="pt-4 text-xs space-y-3 font-mono">
            <div className="flex justify-between py-1 border-b border-border/40 font-sans">
              <span className="text-muted-foreground">Original Payment Reference:</span>
              <Link to={`/payments/${refund.paymentId}`} className="font-mono text-primary hover:underline font-semibold">
                {refund.paymentId}
              </Link>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40 font-sans">
              <span className="text-muted-foreground">Refund Reason:</span>
              <span className="text-foreground">{refund.reason || "Customer reversal"}</span>
            </div>
            <div className="flex justify-between py-1 font-sans">
              <span className="text-muted-foreground">Processed On:</span>
              <span className="text-foreground">{formatDateTime(refund.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundDetailPage;
