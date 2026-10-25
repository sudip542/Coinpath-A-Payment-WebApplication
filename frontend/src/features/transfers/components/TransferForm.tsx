import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { transferApi } from "../transferApi";
import { walletApi } from "@/features/wallet/walletApi";
import { generateIdempotencyKey } from "@/lib/utils";
import { handleApiError } from "@/services/errorHandler";
import { AmountInput } from "@/components/forms/AmountInput";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { formatCurrency } from "@/lib/formatCurrency";
import { Input } from "@/components/ui/input";
import type { TransactionResponseDto } from "@/types/transaction";
import { Send, CheckCircle2, Mail, FileText } from "lucide-react";

export const TransferForm: React.FC = () => {
  const navigate = useNavigate();

  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("500");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Idempotency Key state: retained across network retries of the SAME operation
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => generateIdempotencyKey("trf"));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmedTx, setConfirmedTx] = useState<TransactionResponseDto | null>(null);

  useEffect(() => {
    walletApi.getBalance().then((res) => {
      if (res.data) setAvailableBalance(res.data.balance);
    }).catch(() => {});
  }, []);

  const validate = (): boolean => {
    if (!recipient.trim()) {
      setError("Please specify a recipient email or wallet identifier.");
      return false;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid transfer amount (min ₹0.01).");
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

  const handleTransferConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipient.trim());
    const payload = {
      amount: parseFloat(amount),
      currency: "INR",
      description: description.trim() || undefined,
      ...(isUUID ? { targetWalletId: recipient.trim() } : { recipientEmail: recipient.trim() }),
    };

    try {
      const res = await transferApi.executeTransfer(payload, idempotencyKey);

      if (res.data) {
        setConfirmedTx(res.data);
        setShowConfirm(false);
        toast.success(`Successfully transferred ${formatCurrency(amount)} to ${recipient}!`);
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
        <h3 className="mt-3 text-lg font-bold text-foreground">Transfer Completed Successfully</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Funds have been atomically debited and credited to recipient wallet.
        </p>

        <div className="my-6 rounded-lg border border-border/80 bg-card p-4 text-xs space-y-2 max-w-sm mx-auto text-left font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
              -{formatCurrency(confirmedTx.amount, { currency: confirmedTx.currency })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient:</span>
            <span className="font-semibold text-foreground truncate max-w-[170px]">{recipient}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference:</span>
            <span className="font-semibold text-foreground">{confirmedTx.referenceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Key:</span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
              {idempotencyKey}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setConfirmedTx(null);
              setRecipient("");
              setAmount("500");
              setDescription("");
              setIdempotencyKey(generateIdempotencyKey("trf"));
            }}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted"
          >
            Send Another Transfer
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
          <span className="text-muted-foreground font-medium">Available Balance:</span>
          <span className="font-mono font-bold text-foreground text-sm">
            {formatCurrency(availableBalance)}
          </span>
        </div>

        {/* Recipient Input */}
        <FormField
          id="recipient"
          label="Recipient Identifier"
          description="Enter recipient email address or wallet UUID"
          required
        >
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="recipient"
              placeholder="e.g. sarah.connor@cyber.net or wallet UUID"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                setError(null);
              }}
              disabled={isSubmitting}
              className="pl-9 font-medium"
            />
          </div>
        </FormField>

        {/* Amount Input */}
        <FormField
          id="amount"
          label="Transfer Amount"
          description="Amount to deduct and transfer atomically"
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
            quickAmounts={[200, 500, 1000, 2000, 5000]}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Optional Note */}
        <FormField id="description" label="Note / Reference (Optional)">
          <div className="relative">
            <FileText className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="description"
              placeholder="e.g. Project share / lunch split"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="pl-9"
            />
          </div>
        </FormField>

        {/* Action Button */}
        <SubmitButton
          isLoading={isSubmitting}
          loadingText="Verifying & Transferring..."
          icon={<Send className="size-4" />}
        >
          Transfer {formatCurrency(amount || 0)}
        </SubmitButton>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Money Transfer"
        description={
          <div className="space-y-2 pt-1 text-xs">
            <p>Please double-check the recipient and transfer amount. Atomic ledger transfers are immediate.</p>
            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-semibold text-foreground truncate max-w-[180px]">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-foreground">{formatCurrency(amount)}</span>
              </div>
            </div>
          </div>
        }
        confirmLabel="Authorize Transfer"
        isLoading={isSubmitting}
        onConfirm={handleTransferConfirm}
      />
    </>
  );
};

export default TransferForm;
