import React, { useEffect, useState } from "react";
import { paymentApi } from "../paymentApi";
import { PageHeader } from "@/components/common/PageHeader";
import { PaymentTable } from "../components/PaymentTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AmountInput } from "@/components/forms/AmountInput";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { generateIdempotencyKey } from "@/lib/utils";
import { handleApiError } from "@/services/errorHandler";
import type { PaymentResponseDto, PaymentMethod } from "@/types/transaction";
import { CreditCard, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; correlationId?: string } | null>(null);

  // New Payment Dialog
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("1500");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [description, setDescription] = useState<string>("Online merchant payment");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await paymentApi.getPayments();
      if (res.data) {
        setPayments(res.data);
      }
    } catch (err) {
      const apiErr = handleApiError(err);
      setError({ message: apiErr.message, correlationId: apiErr.correlationId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsSubmitting(true);
    const key = generateIdempotencyKey("pay");

    try {
      const res = await paymentApi.createPayment(
        {
          amount: num,
          currency: "INR",
          paymentMethod,
          description,
        },
        key
      );

      if (res.data) {
        toast.success(`Payment processed! Reference: ${res.data.paymentReference}`);
        setIsDialogOpen(false);
        fetchPayments();
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
        title="Payments"
        description="Checkout transactions, card payments, and gateway provider records."
        actions={
          <Button size="sm" onClick={() => setIsDialogOpen(true)} className="gap-1.5">
            <Plus className="size-3.5" />
            New Payment Checkout
          </Button>
        }
      />

      {error && (
        <ErrorState
          title="Could not load payments"
          message={error.message}
          correlationId={error.correlationId}
          onRetry={fetchPayments}
        />
      )}

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card p-8">
          <LoadingSpinner text="Retrieving payment gateway records..." size="lg" />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="size-8 text-muted-foreground" />}
          title="No payment records found"
          description="Initiate a payment checkout using your configured gateway or card."
          action={
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              Initiate Payment Checkout
            </Button>
          }
        />
      ) : (
        <PaymentTable payments={payments} />
      )}

      {/* New Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Initiate Payment Checkout</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePayment} className="space-y-4 pt-2">
            <FormField id="pay-amt" label="Payment Amount" required>
              <AmountInput
                value={amount}
                onChange={setAmount}
                currency="INR"
                quickAmounts={[500, 1000, 1500, 5000]}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField id="pay-method" label="Payment Method" required>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                disabled={isSubmitting}
              >
                <option value="CARD">Credit / Debit Card</option>
                <option value="UPI">UPI Instant Pay</option>
                <option value="MOCK_GATEWAY">Mock Payment Provider</option>
                <option value="WALLET">Wallet Balance</option>
              </select>
            </FormField>

            <FormField id="pay-desc" label="Description">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Merchant checkout reference"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                disabled={isSubmitting}
              />
            </FormField>

            <SubmitButton
              isLoading={isSubmitting}
              loadingText="Processing through Gateway..."
              icon={<ArrowRight className="size-4" />}
            >
              Confirm & Pay
            </SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
