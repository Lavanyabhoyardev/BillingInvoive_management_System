import type { BaseEntity } from "./common";
import type { AdditionalCharges, QuotationItem } from "./quotation";

/**
 * A reusable quotation template. Stores default items (with default quantities
 * and descriptions) and default charges so the user can load a full quotation
 * skeleton and only edit prices/quantities.
 */
export interface QuotationTemplate extends BaseEntity {
  name: string;
  description?: string;
  category?: string;
  items: QuotationItem[];
  charges: AdditionalCharges;
  gstPercent: number;
  /** Marks built-in seeded templates so they can be reset/recognized. */
  isSeed?: boolean;
}
