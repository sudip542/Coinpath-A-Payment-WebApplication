import React from "react";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number | string | null | undefined;
  currency?: string;
  type?: "CREDIT" | "DEBIT" | "TRANSFER" | "WITHDRAWAL" | "NONE";
  hidden?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = "INR",
  type = "NONE",
  hidden = false,
  size = "md",
  className,
}) => {
  if (hidden) {
    return <span className={cn("font-mono tracking-widest", className)}>••••••</span>;
  }

  const formatted = formatCurrency(amount, { currency });

  let prefix = "";
  let colorClass = "text-foreground";

  if (type === "CREDIT") {
    prefix = "+";
    colorClass = "text-emerald-600 dark:text-emerald-400 font-semibold";
  } else if (type === "DEBIT" || type === "WITHDRAWAL") {
    prefix = "-";
    colorClass = "text-rose-600 dark:text-rose-400 font-semibold";
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-xl font-bold tracking-tight",
    xl: "text-2xl font-extrabold tracking-tight",
    "2xl": "text-3xl sm:text-4xl font-black tracking-tight",
  };

  return (
    <span className={cn("inline-flex items-center font-mono", sizeClasses[size], colorClass, className)}>
      {prefix}{formatted}
    </span>
  );
};

export default CurrencyDisplay;
