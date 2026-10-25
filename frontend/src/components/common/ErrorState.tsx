import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  correlationId?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  correlationId,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-card-foreground",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" />
      </div>
      <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>

      {correlationId && (
        <div className="mt-2 rounded bg-muted/60 px-2 py-1 font-mono text-xs text-muted-foreground">
          Error Ref: {correlationId}
        </div>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 gap-1.5"
        >
          <RefreshCw className="size-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
