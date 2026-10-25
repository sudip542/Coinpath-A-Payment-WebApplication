import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { walletApi } from "../walletApi";
import { generateIdempotencyKey } from "@/lib/utils";
import { handleApiError } from "@/services/errorHandler";
import { AmountInput } from "@/components/forms/AmountInput";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { formatCurrency } from "@/lib/formatCurrency";
import { PAYMENT_METHODS } from "@/lib/constants";
import type { TransactionResponseDto } from "@/types/transaction";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export const AddMoneyForm: React.FC = () => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState<string>("1000");
  const [paymentMethod, setPaymentMethod] = useState<string>("MOCK_GATEWAY");
  const [description, setDescription] = useState<string>("Wallet deposit");
  const [error, setError] = useState<string | null>(null);

  // Idempotency Key state: retained across network retries of the SAME operation
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => generateIdempotencyKey("dep"));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmedTx, setConfirmedTx] = useState<TransactionResponseDto | null>(null);
  const [lastFailedKey, setLastFailedKey] = useState<string | null>(null);

  const validate = (): boolean => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid positive deposit amount (min ₹0.01).");
      return false;
    }
    if (num > 500000) {
      setError("Single deposit limit is ₹5,00,000.00.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirm(true);
    }
  };

  const handleDepositConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    // Reuse existing key if retrying the same failed operation, otherwise keep current
    const keyToUse = idempotencyKey;

    try {
      const res = await walletApi.addMoney(
        {
          amount: parseFloat(amount),
          currency: "INR",
          paymentMethod,
          description,
        },
        keyToUse
      );

      if (res.data) {
        setConfirmedTx(res.data);
        setShowConfirm(false);
        toast.success(`Successfully deposited ${formatCurrency(amount)} to wallet!`);
      }
    } catch (err) {
      const apiErr = handleApiError(err);
      setError(apiErr.message);
      setLastFailedKey(keyToUse);
      toast.error(apiErr.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If operation succeeded, show confirmed receipt screen
  if (confirmedTx) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center animate-in zoom-in-95">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-foreground">Funds Deposited Successfully</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Transaction has been confirmed and written to the immutable ledger.
        </p>

        <div className="my-6 rounded-lg border border-border/80 bg-card p-4 text-xs space-y-2 max-w-sm mx-auto text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount Credited:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              +{formatCurrency(confirmedTx.amount, { currency: confirmedTx.currency })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction Reference:</span>
            <span className="font-mono font-semibold text-foreground">{confirmedTx.referenceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Idempotency Key:</span>
            <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]">
              {idempotencyKey}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setConfirmedTx(null);
              setAmount("1000");
              setIdempotencyKey(generateIdempotencyKey("dep"));
            }}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted"
          >
            Deposit More Funds
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleInitiate} className="space-y-5">
        {/* Amount Input */}
        <FormField
          id="amount"
          label="Deposit Amount"
          description="Enter amount in Indian Rupees (INR)"
          error={error || undefined}
          required
        >
          <AmountInput
            value={amount}
            onChange={(val) => {
              setAmount(val);
              setError(null);
            }}
            currency="INR"
            quickAmounts={[500, 1000, 2500, 5000, 10000]}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Payment Gateway Options */}
        <FormField id="paymentMethod" label="Payment Method" required>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {PAYMENT_METHODS.map((pm) => (
              <label
                key={pm.value}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-xs transition-all ${
                  paymentMethod === pm.value
                    ? "border-primary bg-primary/5 text-foreground font-semibold ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.value}
                    checked={paymentMethod === pm.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="size-3.5 accent-primary"
                    disabled={isSubmitting}
                  />
                  <span>{pm.label}</span>
                </div>
              </label>
            ))}
          </div>
        </FormField>

        {/* Optional Description */}
        <FormField id="description" label="Optional Note">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Wallet deposit"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
            disabled={isSubmitting}
          />
        </FormField>

        {/* Financial Idempotency Note */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Key: {idempotencyKey.slice(0, 18)}...</span>
          </div>
          {lastFailedKey && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              (Will safely reuse key for retry)
            </span>
          )}
        </div>

        {/* Action Button */}
        <SubmitButton
          isLoading={isSubmitting}
          loadingText="Authorizing Deposit..."
          icon={<ArrowRight className="size-4" />}
        >
          Proceed with Deposit ({formatCurrency(amount || 0)})
        </SubmitButton>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Funds Deposit"
        description={
          <div className="space-y-2 pt-1 text-xs">
            <p>You are about to deposit funds into your Coinpath digital wallet.</p>
            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-foreground">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="text-foreground">{paymentMethod}</span>
              </div>
            </div>
          </div>
        }
        confirmLabel="Authorize Deposit"
        isLoading={isSubmitting}
        onConfirm={handleDepositConfirm}
      />
    </>
  );
};

export default AddMoneyForm;
