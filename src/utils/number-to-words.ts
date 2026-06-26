/**
 * Convert a number to words using the Indian numbering system
 * (Lakh / Crore), formatted for currency in Rupees and Paise.
 *
 * Example: 125450.50 -> "One Lakh Twenty Five Thousand Four Hundred
 *          Fifty Rupees and Fifty Paise Only"
 */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

/** Converts an integer (0-999) to words. */
function twoOrThreeDigitsToWords(num: number): string {
  let words = "";
  if (num > 99) {
    words += `${ONES[Math.floor(num / 100)]} Hundred`;
    num %= 100;
    if (num > 0) words += " ";
  }
  if (num > 0) {
    if (num < 20) {
      words += ONES[num];
    } else {
      words += TENS[Math.floor(num / 10)];
      if (num % 10 > 0) words += ` ${ONES[num % 10]}`;
    }
  }
  return words;
}

/** Converts a non-negative integer to words using the Indian system. */
function integerToWords(num: number): string {
  if (num === 0) return "Zero";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  const parts: string[] = [];
  if (crore > 0) parts.push(`${integerToWords(crore)} Crore`);
  if (lakh > 0) parts.push(`${twoOrThreeDigitsToWords(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${twoOrThreeDigitsToWords(thousand)} Thousand`);
  if (hundred > 0) parts.push(twoOrThreeDigitsToWords(hundred));

  return parts.join(" ");
}

/**
 * Converts a currency amount to words including paise.
 * @param amount the monetary value
 * @param currencyName major unit name, default "Rupees"
 * @param subUnitName minor unit name, default "Paise"
 */
export function amountToWords(
  amount: number,
  currencyName = "Rupees",
  subUnitName = "Paise"
): string {
  const safe = Number.isFinite(amount) ? Math.abs(amount) : 0;
  const rupees = Math.floor(safe);
  const paise = Math.round((safe - rupees) * 100);

  const rupeeWords = `${integerToWords(rupees)} ${currencyName}`;
  if (paise > 0) {
    return `${rupeeWords} and ${integerToWords(paise)} ${subUnitName} Only`;
  }
  return `${rupeeWords} Only`;
}
