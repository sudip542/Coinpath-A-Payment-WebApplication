import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { transactionApi } from "../transactionApi";
import { PageHeader } from "@/components/common/PageHeader";
import { TransactionTable } from "../components/TransactionTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleApiError } from "@/services/errorHandler";
import type { TransactionResponseDto } from "@/types/transaction";
import {
  Receipt,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Send,
} from "lucide-react";

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionResponseDto[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; correlationId?: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchTransactions = async (pageToFetch: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await transactionApi.getTransactions(pageToFetch, 15, "DESC");
      if (res.data) {
        setTransactions(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
        setPage(res.data.number || 0);
      }
    } catch (err) {
      const apiErr = handleApiError(err);
      setError({ message: apiErr.message, correlationId: apiErr.correlationId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  // Client-side filtering on current page
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      !searchQuery ||
      tx.referenceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "ALL" || tx.type === selectedType;
    const matchesStatus = selectedStatus === "ALL" || tx.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="Transaction History"
        description="Audited ledger entries, transfer receipts, deposits, and refunds."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link to="/wallet/add-money">
                <Plus className="size-3.5" />
                Add Money
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/transfers/new">
                <Send className="size-3.5" />
                Send Money
              </Link>
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by reference ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-2.5 font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="ALL">All Types</option>
            <option value="CREDIT">Credits</option>
            <option value="DEBIT">Debits</option>
            <option value="TRANSFER">Transfers</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="REFUND">Refunds</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-2.5 font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="REVERSED">Reversed</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Could not load transactions"
          message={error.message}
          correlationId={error.correlationId}
          onRetry={() => fetchTransactions(page)}
        />
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card p-8">
          <LoadingSpinner text="Retrieving immutable transaction ledger..." size="lg" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          icon={<Receipt className="size-8 text-muted-foreground" />}
          title={searchQuery ? "No matching transactions found" : "No transactions recorded yet"}
          description={
            searchQuery
              ? "Try clearing your search query or filters to see all ledger records."
              : "Transactions will appear here automatically when money is added, sent, or refunded."
          }
          action={
            searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("ALL");
                  setSelectedStatus("ALL");
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/wallet/add-money">Add Funds Now</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          <TransactionTable transactions={filteredTransactions} />

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
            <div>
              Showing {filteredTransactions.length} of {totalElements} recorded transactions
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="gap-1 h-8 px-2.5"
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>
              <span className="font-semibold px-2">
                Page {page + 1} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page + 1 >= totalPages}
                className="gap-1 h-8 px-2.5"
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
