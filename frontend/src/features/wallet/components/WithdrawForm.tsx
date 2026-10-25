import React, { useState, useEffect } from "react";
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
import { WITHDRAWAL_METHODS } from "@/lib/constants";
import type { TransactionResponseDto } from "@/types/transaction";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const WithdrawForm: React.FC = () => {
  const navigate = useNavigate();

  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>("500");
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>("BANK_ACCOUNT");
  const [destinationAccount, setDestinationAccount] = useState<string>("HDFC Bank **** 4891");
  const [error, setError] = useState<string | null>(null);

  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => generateIdempotencyKey("wth"));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmedTx, setConfirmedTx] = useState<TransactionResponseDto | null>(null);

  useEffect(() => {
    walletApi.getBalance().then((res) => {
      if (res.data) setAvailableBalance(res.data.balance);
    }).catch(() => {});
  }, []);

  const validate = (): boolean => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid positive withdrawal amount.");
      return false;
    }
    if (num > availableBalance) {
      setError(`Insufficient wallet balance. You have ${formatCurrency(availableBalance)} available.`);
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

  const handleWithdrawConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    const keyToUse = idempotencyKey;

    try {
      const res = await walletApi.withdraw(
        {
          amount: parseFloat(amount),
          currency: "INR",
          destinationAccount,
          withdrawalMethod,
        },
        keyToUse
      );

      if (res.data) {
        setConfirmedTx(res.data);
        setShowConfirm(false);
        toast.success(`Successfully initiated withdrawal of ${formatCurrency(amount)}!`);
      }
    } catch (err) {
      const apiErr = handleApiError(err);
      setError(apiErr.message);
      toast.error(apiErr.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedTx) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center animate-in zoom-in-95">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-foreground">Withdrawal Initiated</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Funds have been debited from your digital wallet and routed to your destination.
        </p>

        <div className="my-6 rounded-lg border border-border/80 bg-card p-4 text-xs space-y-2 max-w-sm mx-auto text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount Debited:</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
              -{formatCurrency(confirmedTx.amount, { currency: confirmedTx.currency })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference ID:</span>
            <span className="font-mono font-semibold text-foreground">{confirmedTx.referenceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Destination:</span>
            <span className="text-foreground font-medium">{destinationAccount}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setConfirmedTx(null);
              setAmount("500");
              setIdempotencyKey(generateIdempotencyKey("wth"));
            }}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted"
          >
            New Withdrawal
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
        {/* Available Balance banner */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
          <span className="text-muted-foreground font-medium">Authoritative Balance:</span>
          <span className="font-mono font-bold text-foreground text-sm">
            {formatCurrency(availableBalance)}
          </span>
        </div>

        {/* Amount Input */}
        <FormField
          id="amount"
          label="Withdrawal Amount"
          description="Enter amount to transfer to linked destination"
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
            quickAmounts={[500, 1000, 2000, 5000]}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Withdrawal Method */}
        <FormField id="withdrawalMethod" label="Withdrawal Method" required>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {WITHDRAWAL_METHODS.map((wm) => (
              <label
                key={wm.value}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-xs transition-all ${
                  withdrawalMethod === wm.value
                    ? "border-primary bg-primary/5 text-foreground font-semibold ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="withdrawalMethod"
                    value={wm.value}
                    checked={withdrawalMethod === wm.value}
                    onChange={(e) => {
                      setWithdrawalMethod(e.target.value);
                      if (e.target.value === "UPI_ID") {
                        setDestinationAccount("alex@okaxis");
                      } else {
                        setDestinationAccount("HDFC Bank **** 4891");
                      }
                    }}
                    className="size-3.5 accent-primary"
                    disabled={isSubmitting}
                  />
                  <span>{wm.label}</span>
                </div>
              </label>
            ))}
          </div>
        </FormField>

        {/* Destination Account */}
        <FormField id="destination" label="Destination Detail" required>
          <input
            type="text"
            value={destinationAccount}
            onChange={(e) => setDestinationAccount(e.target.value)}
            disabled={isSubmitting}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono font-semibold"
          />
        </FormField>

        {/* Action Button */}
        <SubmitButton
          isLoading={isSubmitting}
          loadingText="Processing Withdrawal..."
          icon={<ArrowRight className="size-4" />}
        >
          Withdraw {formatCurrency(amount || 0)}
        </SubmitButton>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Funds Withdrawal"
        description={
          <div className="space-y-2 pt-1 text-xs">
            <p>You are withdrawing funds from Coinpath wallet to your linked destination.</p>
            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-foreground">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination:</span>
                <span className="text-foreground">{destinationAccount}</span>
              </div>
            </div>
          </div>
        }
        confirmLabel="Authorize Withdrawal"
        isLoading={isSubmitting}
        onConfirm={handleWithdrawConfirm}
      />
    </>
  );
};

export default WithdrawForm;
