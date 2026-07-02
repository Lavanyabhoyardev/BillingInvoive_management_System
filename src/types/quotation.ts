import type { BaseEntity, ID } from "./common";

/** Units commonly used by a hardware service business. */
export type ItemUnit =
  | "Nos"
  | "Pcs"
  | "Set"
  | "Hour"
  | "Day"
  | "Month"
  | "Year"
  | "Service"
  | "Meter"
  | "Unit";

export const ITEM_UNITS: ItemUnit[] = [
  "Nos",
  "Pcs",
  "Set",
  "Hour",
  "Day",
  "Month",
  "Year",
  "Service",
  "Meter",
  "Unit",
];

/** A single line item in a quotation. */
export interface QuotationItem {
  id: ID;
  name: string;
  description?: string;
  quantity: number;
  unit: ItemUnit;
  price: number;
  /** Derived: quantity * price. Stored for snapshotting but always recomputed. */
  amount: number;
}

/** Extra charges applied on top of item subtotal. */
export interface AdditionalCharges {
  serviceCharge: number;
  installationCharge: number;
  visitingCharge: number;
  transportationCharge: number;
  otherCharges: number;
}

/** Customer info captured on a quotation. */
export interface CustomerDetails {
  name: string;
  phone: string;
  address?: string;
}

/** Computed monetary summary. Recalculated on every change. */
export interface QuotationTotals {
  subtotal: number;
  chargesTotal: number;
  discount: number;
  taxableAmount: number;
  gstAmount: number;
  grandTotal: number;
  grandTotalInWords: string;
}

export type QuotationStatus = "draft" | "final";

/**
 * A quotation. Drafts and finalized quotations share the same shape and table,
 * distinguished by `status`. This keeps "Convert to Quotation" a one-field change
 * and makes future Invoice conversion trivial.
 */
export interface Quotation extends BaseEntity {
  quotationNumber: string;
  status: QuotationStatus;
  date: string; // yyyy-mm-dd
  validTill?: string; // yyyy-mm-dd

  customer: CustomerDetails;
  items: QuotationItem[];
  charges: AdditionalCharges;
  /** When false, additional charges are excluded from totals and hidden on the PDF. Defaults to true. */
  includeCharges?: boolean;
  discount: number; // absolute currency amount
  gstPercent: number;

  notes?: string;

  /** Snapshot of computed totals at save time (also recomputed on display). */
  totals: QuotationTotals;
}

/** Default empty charges. */
export const EMPTY_CHARGES: AdditionalCharges = {
  serviceCharge: 0,
  installationCharge: 0,
  visitingCharge: 0,
  transportationCharge: 0,
  otherCharges: 0,
};
