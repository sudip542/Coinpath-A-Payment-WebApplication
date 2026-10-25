/**
 * Currency formatting utility for Coinpath Fintech Platform
 */

export interface FormatCurrencyOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function getCurrencySymbol(currency: string = "INR"): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0.00";
  }

  const numericValue = typeof amount === "string" ? parseFloat(amount) : amount;
  const currency = options.currency || "INR";
  const minDigits = options.minimumFractionDigits ?? 2;
  const maxDigits = options.maximumFractionDigits ?? 2;

  try {
    const formatter = new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: options.showSymbol === false ? "decimal" : "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });
    return formatter.format(numericValue);
  } catch {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${numericValue.toFixed(minDigits)}`;
  }
}

export function formatNumberOnly(
  amount: number | string | null | undefined,
  decimals: number = 2
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "0.00";
  }
  const numericValue = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);
}
