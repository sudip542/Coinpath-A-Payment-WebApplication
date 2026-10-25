import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { paymentApi } from "../paymentApi";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatDate";
import { handleApiError } from "@/services/errorHandler";
import type { PaymentResponseDto } from "@/types/transaction";
import { ChevronLeft, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PaymentDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [payment, setPayment] = useState<PaymentResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; correlationId?: string } | null>(null);

  useEffect(() => {
    if (!reference) return;

    setIsLoading(true);
    paymentApi
      .getPaymentByReference(reference)
      .then((res) => {
        if (res.data) setPayment(res.data);
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
        <LoadingSpinner text="Retrieving payment details..." size="lg" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          to="/payments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back to Payments
        </Link>
        <ErrorState
          title="Payment Not Found"
          message={error?.message || "Could not find payment details"}
          correlationId={error?.correlationId}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in-50 duration-200">
      <Link
        to="/payments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-3.5" />
        Back to Payments
      </Link>

      <PageHeader
        title={`Payment ${payment.paymentReference}`}
        description="Gateway transaction record and status verification."
        badge={<StatusBadge status={payment.status} />}
        actions={
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to="/refunds">
              Request Refund
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        }
      />

      <Card className="border-border/80 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between pb-6 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <CreditCard className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total Paid</p>
                <CurrencyDisplay amount={payment.amount} currency={payment.currency} size="xl" />
              </div>
            </div>
            <StatusBadge status={payment.status} />
          </div>

          <div className="pt-4 text-xs space-y-3 font-mono">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground font-sans">Payment Method:</span>
              <span className="font-semibold text-foreground">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground font-sans">Gateway Transaction ID:</span>
              <span className="text-foreground">{payment.gatewayTransactionId || "N/A"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground font-sans">Source Wallet ID:</span>
              <span className="text-foreground truncate max-w-[200px]">{payment.walletId}</span>
            </div>
            <div className="flex justify-between py-1 font-sans">
              <span className="text-muted-foreground">Processed On:</span>
              <span className="text-foreground">{formatDateTime(payment.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentDetailPage;
