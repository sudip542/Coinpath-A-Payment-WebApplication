import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, RotateCcw, Ban, ShieldCheck } from "lucide-react";

export type StatusType =
  | "SUCCESS"
  | "PROCESSING"
  | "INITIATED"
  | "FAILED"
  | "REVERSED"
  | "ACTIVE"
  | "BLOCKED"
  | "CLOSED"
  | "SENT"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  className,
}) => {
  const normalized = (status || "").toUpperCase();

  switch (normalized) {
    case "SUCCESS":
    case "ACTIVE":
    case "SENT":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
            className
          )}
        >
          {showIcon && (normalized === "ACTIVE" ? <ShieldCheck className="size-3.5" /> : <CheckCircle2 className="size-3.5" />)}
          {normalized}
        </span>
      );

    case "PROCESSING":
    case "INITIATED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
            className
          )}
        >
          {showIcon && <Clock className="size-3.5 animate-pulse" />}
          {normalized}
        </span>
      );

    case "FAILED":
    case "BLOCKED":
    case "CLOSED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
            className
          )}
        >
          {showIcon && (normalized === "BLOCKED" || normalized === "CLOSED" ? <Ban className="size-3.5" /> : <AlertCircle className="size-3.5" />)}
          {normalized}
        </span>
      );

    case "REVERSED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
            className
          )}
        >
          {showIcon && <RotateCcw className="size-3.5" />}
          {normalized}
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground",
            className
          )}
        >
          {normalized}
        </span>
      );
  }
};

export default StatusBadge;
