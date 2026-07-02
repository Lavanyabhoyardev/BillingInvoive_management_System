import type {
  AdditionalCharges,
  QuotationItem,
  QuotationTotals,
} from "@/types";
import { round2 } from "./currency";
import { amountToWords } from "./number-to-words";

/** Computes the amount for a single line item. */
export function computeItemAmount(quantity: number, price: number): number {
  return round2((Number(quantity) || 0) * (Number(price) || 0));
}

/** Sums all additional charges. */
export function sumCharges(charges: AdditionalCharges): number {
  return round2(
    (charges.serviceCharge || 0) +
      (charges.installationCharge || 0) +
      (charges.visitingCharge || 0) +
      (charges.transportationCharge || 0) +
      (charges.otherCharges || 0)
  );
}

/** Sums the subtotal across all items. */
export function sumItems(items: QuotationItem[]): number {
  return round2(
    items.reduce(
      (acc, item) => acc + computeItemAmount(item.quantity, item.price),
      0
    )
  );
}

export interface CalculateTotalsInput {
  items: QuotationItem[];
  charges: AdditionalCharges;
  discount: number;
  gstPercent: number;
  /**
   * When `false`, additional charges are excluded from the total (and therefore
   * hidden on the printed document). Defaults to `true` for backward compat.
   */
  includeCharges?: boolean;
}

/**
 * Calculation engine — the single source of truth for quotation math.
 *
 * Flow:
 *   subtotal       = Σ items
 *   chargesTotal   = Σ additional charges
 *   taxableAmount  = subtotal + chargesTotal - discount  (floored at 0)
 *   gstAmount      = taxableAmount * gst%
 *   grandTotal     = taxableAmount + gstAmount
 */
export function calculateTotals(
  input: CalculateTotalsInput,
  currencyName = "Rupees"
): QuotationTotals {
  const subtotal = sumItems(input.items);
  const chargesTotal =
    input.includeCharges === false ? 0 : sumCharges(input.charges);
  const discount = round2(Math.max(0, input.discount || 0));

  const taxableAmount = round2(Math.max(0, subtotal + chargesTotal - discount));
  const gstAmount = round2((taxableAmount * (input.gstPercent || 0)) / 100);
  const grandTotal = round2(taxableAmount + gstAmount);

  return {
    subtotal,
    chargesTotal,
    discount,
    taxableAmount,
    gstAmount,
    grandTotal,
    grandTotalInWords: amountToWords(grandTotal, currencyName),
  };
}
