import Dexie, { type Table } from "dexie";
import type {
  AppSettings,
  CompanyProfile,
  Estimate,
  Invoice,
  Quotation,
  QuotationTemplate,
} from "@/types";

/**
 * IndexedDB database (via Dexie) for the offline quotation app.
 *
 * Tables:
 *  - company   : single business profile record
 *  - settings  : single app-settings record (numbering, preferences)
 *  - quotations: drafts AND finalized quotations (distinguished by `status`)
 *  - templates : reusable quotation templates
 *  - invoices  : bills, with payment tracking (status/method/paid amount)
 *  - estimates : lightweight cost estimates
 *
 * Indexes are chosen to support search (customer/phone/number/date) and
 * sorting without full scans. New tables (payments, stock, etc.) can be added
 * in future versions via `this.version(n).stores(...)`.
 */
export class QuotationDatabase extends Dexie {
  company!: Table<CompanyProfile, string>;
  settings!: Table<AppSettings, string>;
  quotations!: Table<Quotation, string>;
  templates!: Table<QuotationTemplate, string>;
  invoices!: Table<Invoice, string>;
  estimates!: Table<Estimate, string>;

  constructor() {
    super("QuotationManagerDB");

    this.version(1).stores({
      company: "id, companyName, updatedAt",
      settings: "id",
      quotations:
        "id, status, quotationNumber, date, createdAt, updatedAt, customer.name, customer.phone",
      templates: "id, name, category, createdAt, updatedAt",
    });

    // v2: invoices + estimates modules.
    this.version(2).stores({
      company: "id, companyName, updatedAt",
      settings: "id",
      quotations:
        "id, status, quotationNumber, date, createdAt, updatedAt, customer.name, customer.phone",
      templates: "id, name, category, createdAt, updatedAt",
      invoices:
        "id, status, invoiceNumber, date, dueDate, paymentStatus, createdAt, updatedAt, customer.name, customer.phone",
      estimates: "id, estimateNumber, title, date, createdAt, updatedAt, forName",
    });
  }
}

/**
 * Singleton database instance.
 * Guarded so it is only instantiated in the browser (IndexedDB unavailable on server).
 */
let _db: QuotationDatabase | null = null;

export function getDb(): QuotationDatabase {
  if (typeof window === "undefined") {
    throw new Error("Database is only available in the browser.");
  }
  if (!_db) {
    _db = new QuotationDatabase();
  }
  return _db;
}

/** Convenience accessor used by services/hooks running in the browser. */
export const db = new Proxy({} as QuotationDatabase, {
  get(_target, prop) {
    const instance = getDb();
    // @ts-expect-error dynamic proxy access to Dexie instance members
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
