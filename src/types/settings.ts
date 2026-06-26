import type { BaseEntity } from "./common";

/**
 * App-level settings. A single record (id = APP_SETTINGS_ID).
 * Holds preferences and the running counter for quotation numbering.
 */
export interface AppSettings extends BaseEntity {
  currencyCode: string; // e.g. "INR"
  currencySymbol: string; // e.g. "₹"
  /** Prefix for auto quotation numbers, e.g. "QTN". */
  quotationPrefix: string;
  /** Last used numeric sequence; next number = lastSequence + 1. */
  lastSequence: number;
  /** Prefix for auto invoice numbers, e.g. "INV". */
  invoicePrefix: string;
  /** Last used invoice sequence. */
  lastInvoiceSequence: number;
  /** Prefix for auto estimate numbers, e.g. "EST". */
  estimatePrefix: string;
  /** Last used estimate sequence. */
  lastEstimateSequence: number;
  /** Default GST percentage applied to new quotations. */
  defaultGstPercent: number;
  /** Default validity in days for "Valid Till". */
  defaultValidityDays: number;
  /** Default due-date offset (days) for new invoices. */
  defaultDueDays: number;
  theme: "light" | "dark" | "system";
}

export const APP_SETTINGS_ID = "app-settings";

export const DEFAULT_SETTINGS: Omit<
  AppSettings,
  "id" | "createdAt" | "updatedAt"
> = {
  currencyCode: "INR",
  currencySymbol: "₹",
  quotationPrefix: "QTN",
  lastSequence: 0,
  invoicePrefix: "INV",
  lastInvoiceSequence: 0,
  estimatePrefix: "EST",
  lastEstimateSequence: 0,
  defaultGstPercent: 18,
  defaultValidityDays: 15,
  defaultDueDays: 7,
  theme: "system",
};
