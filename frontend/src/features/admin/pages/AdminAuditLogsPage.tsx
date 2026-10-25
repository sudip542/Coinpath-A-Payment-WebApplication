import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common/PageHeader";
import { AuditLogTable } from "../components/AuditLogTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/apiClient";
import { API_ROUTES } from "@/services/apiRoutes";
import { mockApi, isMockMode } from "@/services/mockApi";
import { handleApiError } from "@/services/errorHandler";
import type { Page } from "@/types/api";
import type { AuditLog } from "@/types/transaction";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

export const AdminAuditLogsPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; correlationId?: string } | null>(null);

  const fetchLogs = async (pageToFetch: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isMockMode()) {
        const res = await mockApi.getAuditLogs(pageToFetch, 15);
        setLogs(res.content || []);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || 0);
        setPage(res.number || 0);
      } else {
        const res = await apiClient.get<Page<AuditLog>>(
          `${API_ROUTES.ADMIN_AUDIT_LOGS}?page=${pageToFetch}&size=15`
        );
        if (res.data) {
          setLogs(res.data.content || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalElements(res.data.totalElements || 0);
          setPage(res.data.number || 0);
        }
      }
    } catch (err) {
      const apiErr = handleApiError(err);
      setError({ message: apiErr.message, correlationId: apiErr.correlationId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchLogs(page);
    }
  }, [page, isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-3.5" />
        Back to Admin Dashboard
      </Link>

      <PageHeader
        title="Audit Logs Trail"
        description="Immutable record of user authentication, ledger deposits, transfers, and status transitions."
        badge={
          <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            COMPLIANCE LOGS
          </span>
        }
      />

      {error && (
        <ErrorState
          title="Could not load audit trail"
          message={error.message}
          correlationId={error.correlationId}
          onRetry={() => fetchLogs(page)}
        />
      )}

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card p-8">
          <LoadingSpinner text="Retrieving immutable audit records..." size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-8 text-muted-foreground" />}
          title="No audit entries found"
          description="Actions performed in the system will automatically append immutable log entries."
        />
      ) : (
        <div className="space-y-4">
          <AuditLogTable logs={logs} />

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
            <div>
              Showing {logs.length} of {totalElements} audit log events
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

export default AdminAuditLogsPage;
