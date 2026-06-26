/** Share helpers using offline-friendly deep links (no backend). */

import { formatCurrency } from "@/utils";

interface ShareDocInput {
  docLabel: string; // "Invoice" | "Quotation" | "Estimate"
  number: string;
  customerName?: string;
  companyName?: string;
  grandTotal: number;
  currencySymbol?: string;
}

/** Builds a short human message describing a document. */
export function buildShareMessage({
  docLabel,
  number,
  customerName,
  companyName,
  grandTotal,
  currencySymbol = "₹",
}: ShareDocInput): string {
  const lines = [
    customerName ? `Hello ${customerName},` : "Hello,",
    `Please find your ${docLabel} ${number}.`,
    `Total: ${formatCurrency(grandTotal, currencySymbol)}`,
  ];
  if (companyName) lines.push(`— ${companyName}`);
  return lines.join("\n");
}

/** Normalizes a phone number to digits with country code for wa.me. */
function normalizePhone(phone?: string, defaultCc = "91"): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return defaultCc + digits;
  return digits;
}

/** Opens WhatsApp with a prefilled message (to a number if available). */
export function shareViaWhatsApp(message: string, phone?: string): void {
  const num = normalizePhone(phone);
  const base = num ? `https://wa.me/${num}` : "https://wa.me/";
  const url = `${base}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Opens the default email client with a prefilled subject + body. */
export function shareViaEmail(
  subject: string,
  body: string,
  to?: string
): void {
  const url = `mailto:${to ?? ""}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}
