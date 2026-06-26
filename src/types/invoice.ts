import type { BaseEntity, ID } from "./common";
import type {
  AdditionalCharges,
  CustomerDetails,
  QuotationItem,
  QuotationTotals,
} from "./quotation";

/** Lifecycle/payment status of an invoice. */
export type PaymentStatus = "paid" | "unpaid" | "partial" | "cancelled";

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partially Paid" },
  { value: "cancelled", label: "Cancelled" },
];

/** Payment method used to settle an invoice. */
export type PaymentMethod =
  | "cash"
  | "upi"
  | "card"
  | "bank"
  | "cheque"
  | "other";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

/** Customer details on an invoice (phone/address optional). */
export interface InvoiceCustomer extends CustomerDetails {
  /** Optional customer GSTIN printed on the bill. */
  gstNumber?: string;
}

/** Draft = work-in-progress bill; final = issued bill. */
export type InvoiceStatus = "draft" | "final";

/**
 * An invoice / bill. Shares the items + charges + totals shape with quotations
 * (so conversion is a straight copy) and adds payment tracking.
 */
export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  status: InvoiceStatus;
  date: string; // yyyy-mm-dd
  dueDate?: string; // yyyy-mm-dd

  customer: InvoiceCustomer;
  items: QuotationItem[];
  charges: AdditionalCharges;
  discount: number;
  gstPercent: number;
  notes?: string;

  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  /** Amount paid so far (used when paymentStatus === "partial"). */
  paidAmount: number;

  /** Link back to the quotation this invoice was converted from, if any. */
  sourceQuotationId?: ID;

  totals: QuotationTotals;
}

/** Computes the remaining balance for an invoice. */
export function invoiceBalance(invoice: Invoice): number {
  if (invoice.paymentStatus === "paid") return 0;
  if (invoice.paymentStatus === "cancelled") return 0;
  return Math.max(0, invoice.totals.grandTotal - (invoice.paidAmount || 0));
}

/** Effective paid amount given the status (paid ⇒ full, unpaid ⇒ 0). */
export function effectivePaidAmount(invoice: Invoice): number {
  switch (invoice.paymentStatus) {
    case "paid":
      return invoice.totals.grandTotal;
    case "partial":
      return Math.min(invoice.paidAmount || 0, invoice.totals.grandTotal);
    default:
      return 0;
  }
}
