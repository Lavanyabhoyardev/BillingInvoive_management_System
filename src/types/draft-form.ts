import type {
  AdditionalCharges,
  CustomerDetails,
  QuotationItem,
} from "./quotation";

/**
 * In-memory working state for the quotation builder form.
 * Mirrors a Quotation but without persistence metadata; converted to a
 * Quotation record on save.
 */
export interface QuotationFormState {
  quotationNumber: string;
  date: string;
  validTill: string;
  customer: CustomerDetails;
  items: QuotationItem[];
  charges: AdditionalCharges;
  discount: number;
  gstPercent: number;
  notes: string;
}
