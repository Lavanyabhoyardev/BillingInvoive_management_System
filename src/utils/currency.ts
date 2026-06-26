/** Currency formatting helpers (Indian Rupee by default). */

/** Rounds to 2 decimals avoiding floating point noise. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number as currency using the Indian grouping system.
 * @param value amount
 * @param symbol currency symbol, default "₹"
 */
export function formatCurrency(value: number, symbol = "₹"): string {
  const safe = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(safe));
  const sign = safe < 0 ? "-" : "";
  return `${sign}${symbol}${formatted}`;
}

/** Parses a possibly-formatted string into a safe number (>= 0 by default). */
export function parseAmount(input: string | number, allowNegative = false): number {
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : 0;
  }
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const value = parseFloat(cleaned);
  if (!Number.isFinite(value)) return 0;
  return allowNegative ? value : Math.max(0, value);
}
