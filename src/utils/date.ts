/** Date helpers. All quotation dates are stored as yyyy-mm-dd strings. */

/** Returns today's date as yyyy-mm-dd (local time). */
export function todayISO(): string {
  return toDateInputValue(new Date());
}

/** Converts a Date to a yyyy-mm-dd string suitable for <input type="date">. */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Adds N days to a yyyy-mm-dd string and returns yyyy-mm-dd. */
export function addDays(dateISO: string, days: number): string {
  const date = new Date(dateISO);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

/** Formats a yyyy-mm-dd (or ISO) string as a friendly display date, e.g. "25 Jun 2026". */
export function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Formats an ISO timestamp as date + time. */
export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
