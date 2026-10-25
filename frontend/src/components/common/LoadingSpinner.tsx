import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
  center?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = "md",
  text,
  center = false,
}) => {
  const sizeClasses = {
    sm: "size-4",
    md: "size-6",
    lg: "size-8",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );

  if (center) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center p-8">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
