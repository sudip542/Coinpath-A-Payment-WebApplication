import React from "react";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/formatCurrency";

interface AmountInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string | number;
  onChange: (value: string) => void;
  currency?: string;
  quickAmounts?: number[];
  error?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  currency = "INR",
  quickAmounts = [500, 1000, 2500, 5000, 10000],
  error,
  className,
  disabled,
  ...props
}) => {
  const symbol = getCurrencySymbol(currency);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Allow only numeric characters and at most one decimal point with 2 decimals
    if (/^\d*\.?\d{0,2}$/.test(val) || val === "") {
      onChange(val);
    }
  };

  const handleQuickSelect = (amt: number) => {
    if (!disabled) {
      onChange(amt.toString());
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3.5 text-lg font-bold text-muted-foreground">
          {symbol}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="0.00"
          className={cn(
            "flex h-12 w-full rounded-lg border border-input bg-background pl-9 pr-4 font-mono text-xl font-bold tracking-tight text-foreground transition-all placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive/30",
            className
          )}
          {...props}
        />
      </div>

      {quickAmounts && quickAmounts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickAmounts.map((amt) => {
            const isSelected = Number(value) === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickSelect(amt)}
                disabled={disabled}
                className={cn(
                  "rounded-md border border-input bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-50",
                  isSelected && "border-primary bg-primary/10 text-primary font-bold"
                )}
              >
                +{symbol}{amt.toLocaleString("en-IN")}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
};

export default AmountInput;
