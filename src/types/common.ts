/**
 * Shared primitive types and base entity shape.
 * Every persisted record extends BaseEntity so future modules
 * (invoices, stock, payments, etc.) inherit a consistent shape.
 */

export type ID = string;

/** ISO timestamp string, e.g. "2026-06-25T10:00:00.000Z" */
export type ISODate = string;

export interface BaseEntity {
  id: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/** Generic option used by selects/dropdowns. */
export interface SelectOption<T = string> {
  label: string;
  value: T;
}

/** Sort direction used across list views. */
export type SortDirection = "asc" | "desc";
