import React, { useEffect, useState } from "react";
import { refundApi } from "../refundApi";
import { PageHeader } from "@/components/common/PageHeader";
import { RefundTable } from "../components/RefundTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AmountInput } from "@/components/forms/AmountInput";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import { generateIdempotencyKey } from "@/lib/utils";
import { handleApiError } from "@/services/errorHandler";
import type { RefundResponseDto } from "@/types/transaction";
import { RotateCcw, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const RefundsPage: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; correlationId?: string } | null>(null);

  // New Refund Dialog
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [paymentRef, setPaymentRef] = useState<string>("PAY-20261024-991");
  const [amount, setAmount] = useState<string>("1000");
  const [reason, setReason] = useState<string>("Duplicate order cancellation");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchRefunds = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await refundApi.getRefunds();
      if (res.data) {
        setRefunds(res.data);
      }
    } catch (err) {
      const apiErr = handleApiError(err);
      setError({ message: apiErr.message, correlationId: apiErr.correlationId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRef.trim()) {
      toast.error("Please provide a valid original payment reference");
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    setIsSubmitting(true);
    const key = generateIdempotencyKey("ref");

    try {
      const res = await refundApi.createRefund(
        {
          paymentReference: paymentRef.trim(),
          amount: num,
          reason: reason.trim(),
        },
        key
      );

      if (res.data) {
        toast.success(`Refund initiated! Reference: ${res.data.refundReference}`);
        setIsDialogOpen(false);
        fetchRefunds();
      }
    } catch (err) {
      const apiErr = handleApiError(err);
      toast.error(apiErr.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="Refunds"
        description="Track payment reversals, merchant refunds, and return credit ledger records."
        actions={
          <Button size="sm" onClick={() => setIsDialogOpen(true)} className="gap-1.5">
            <Plus className="size-3.5" />
            Request New Refund
          </Button>
        }
      />

      {error && (
        <ErrorState
          title="Could not load refunds"
          message={error.message}
          correlationId={error.correlationId}
          onRetry={fetchRefunds}
        />
      )}

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card p-8">
          <LoadingSpinner text="Retrieving refund ledger records..." size="lg" />
        </div>
      ) : refunds.length === 0 ? (
        <EmptyState
          icon={<RotateCcw className="size-8 text-muted-foreground" />}
          title="No refund records found"
          description="Initiate a refund against an existing payment record if eligible."
          action={
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              Request Refund
            </Button>
          }
        />
      ) : (
        <RefundTable refunds={refunds} />
      )}

      {/* Request Refund Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Request Payment Refund</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRefund} className="space-y-4 pt-2">
            <FormField id="pay-ref" label="Original Payment Reference" required>
              <Input
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. PAY-20261024-991"
                className="font-mono text-xs"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField id="ref-amt" label="Refund Amount" required>
              <AmountInput
                value={amount}
                onChange={setAmount}
                currency="INR"
                quickAmounts={[250, 500, 1000, 1500]}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField id="ref-reason" label="Reason for Refund">
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason or customer support ticket"
                className="text-xs"
                disabled={isSubmitting}
              />
            </FormField>

            <SubmitButton
              isLoading={isSubmitting}
              loadingText="Validating with Gateway..."
              icon={<ArrowRight className="size-4" />}
            >
              Submit Refund Request
            </SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundsPage;
