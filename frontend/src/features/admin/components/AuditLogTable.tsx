import React from "react";
import { formatDateTime, formatRelativeTime } from "@/lib/formatDate";
import type { AuditLog } from "@/types/transaction";

interface AuditLogTableProps {
  logs: AuditLog[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4">Action</th>
            <th className="py-3 px-4">Resource Type</th>
            <th className="py-3 px-4">Resource ID</th>
            <th className="py-3 px-4">IP Address</th>
            <th className="py-3 px-4">Payload Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 font-mono">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-muted/30 transition-colors">
              <td className="py-3.5 px-4 font-sans text-muted-foreground whitespace-nowrap">
                <div>{formatDateTime(log.timestamp)}</div>
                <div className="text-[10px]">{formatRelativeTime(log.timestamp)}</div>
              </td>
              <td className="py-3.5 px-4">
                <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                  {log.action}
                </span>
              </td>
              <td className="py-3.5 px-4 font-sans font-semibold text-foreground">
                {log.resourceType}
              </td>
              <td className="py-3.5 px-4 text-muted-foreground text-[11px] truncate max-w-[140px]">
                {log.resourceId}
              </td>
              <td className="py-3.5 px-4 text-muted-foreground">
                {log.ipAddress || "127.0.0.1"}
              </td>
              <td className="py-3.5 px-4 text-muted-foreground text-[11px] max-w-[240px] truncate">
                {log.details || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogTable;
