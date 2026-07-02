import type { BaseEntity } from "./common";
import type {
  AdditionalCharges,
  QuotationItem,
  QuotationTotals,
} from "./quotation";

/**
 * A lightweight cost estimate — "kisi bhi cheez ka estimate".
 * No formal customer/quotation flow: just a titled costing sheet with items,
 * charges and computed totals. Printable and saved to history.
 */
export interface Estimate extends BaseEntity {
  estimateNumber: string;
  /** What is being estimated, e.g. "Gaming PC Build", "Office CCTV". */
  title: string;
  /** Optional person/customer the estimate is for. */
  forName?: string;
  date: string; // yyyy-mm-dd

  items: QuotationItem[];
  charges: AdditionalCharges;
  /** When false, additional charges are excluded from totals and hidden on the PDF. Defaults to true. */
  includeCharges?: boolean;
  discount: number;
  gstPercent: number;
  notes?: string;

  totals: QuotationTotals;
}
