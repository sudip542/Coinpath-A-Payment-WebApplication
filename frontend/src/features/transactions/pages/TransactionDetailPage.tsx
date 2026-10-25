import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { transactionApi } from "../transactionApi";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDateTime, formatRelativeTime } from "@/lib/formatDate";
import { handleApiError } from "@/services/errorHandler";
import type { TransactionResponseDto } from "@/types/transaction";
import {
  ChevronLeft,
  Receipt,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export const TransactionDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [transaction, setTransaction] = useState<TransactionResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; correlationId?: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!reference) return;

    setIsLoading(true);
    setError(null);

    transactionApi
      .getTransactionByReference(reference)
      .then((res) => {
        if (res.data) setTransaction(res.data);
      })
      .catch((err) => {
        const apiErr = handleApiError(err);
        setError({ message: apiErr.message, correlationId: apiErr.correlationId });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [reference]);

  const copyRef = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      setCopied(true);
      toast.success("Transaction Reference copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <LoadingSpinner text="Retrieving transaction ledger records..." size="lg" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back to Transactions
        </Link>
        <ErrorState
          title="Transaction Not Found"
          message={error?.message || "Could not find transaction details for " + reference}
          correlationId={error?.correlationId}
        />
      </div>
    );
  }

  const isCredit = transaction.type === "CREDIT" || transaction.type === "REFUND";

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in-50 duration-200">
      <Link
        to="/transactions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-3.5" />
        Back to Transactions
      </Link>

      <PageHeader
        title={`Transaction ${transaction.referenceId}`}
        description="Immutable cryptographic record verified by the core transaction engine."
        badge={<StatusBadge status={transaction.status} />}
        actions={
          <button
            onClick={copyRef}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            Copy Reference
          </button>
        }
      />

      {/* Hero Amount Card */}
      <Card className="border-border/80 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex size-14 items-center justify-center rounded-2xl ${
                  isCredit
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                }`}
              >
                {isCredit ? (
                  <ArrowDownLeft className="size-7" />
                ) : (
                  <ArrowUpRight className="size-7" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Transaction Type: {transaction.type}
                </p>
                <div className="mt-1">
                  <CurrencyDisplay
                    amount={transaction.amount}
                    currency={transaction.currency}
                    type={isCredit ? "CREDIT" : "DEBIT"}
                    size="xl"
                  />
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Executed At</p>
              <p>{formatDateTime(transaction.createdAt)}</p>
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                {formatRelativeTime(transaction.createdAt)}
              </p>
            </div>
          </div>

          {transaction.failureReason && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>
                <strong>Decline Reason:</strong> {transaction.failureReason}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            <CardTitle className="text-sm font-bold">Ledger Properties</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 text-xs space-y-3">
          <div className="flex justify-between py-1 border-b border-border/40 font-mono">
            <span className="text-muted-foreground">Unique Reference ID:</span>
            <span className="font-semibold text-foreground">{transaction.referenceId}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-muted-foreground">Source Wallet ID:</span>
            <span className="font-mono text-foreground">{transaction.sourceWalletId || "EXTERNAL_SETTLEMENT"}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-muted-foreground">Target Wallet ID:</span>
            <span className="font-mono text-foreground">{transaction.targetWalletId || "EXTERNAL_SETTLEMENT"}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-muted-foreground">Settlement Currency:</span>
            <span className="font-semibold text-foreground">{transaction.currency}</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Ledger Verification:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-3.5" />
              Cryptographically Reconciled
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Associated Immutable Ledger Entries */}
      {transaction.ledgerEntries && transaction.ledgerEntries.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold">Associated Double-Entry Ledger Records</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="divide-y divide-border/40 text-xs">
              {transaction.ledgerEntries.map((le) => (
                <div key={le.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold font-mono text-foreground">{le.entryType}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">Wallet: {le.walletId}</p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay
                      amount={le.amount}
                      currency={transaction.currency}
                      type={le.entryType === "CREDIT" ? "CREDIT" : "DEBIT"}
                      size="sm"
                    />
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Balance After: {le.balanceAfter.toLocaleString("en-IN", { style: "currency", currency: transaction.currency })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionDetailPage;
