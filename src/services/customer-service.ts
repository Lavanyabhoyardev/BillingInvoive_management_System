import { getDb } from "@/db";
import type { Invoice, Quotation } from "@/types";
import { effectivePaidAmount, invoiceBalance } from "@/types";

export interface CustomerSummary {
  /** Stable key: normalized phone if present, else lowercased name. */
  key: string;
  name: string;
  phone: string;
  totalQuotations: number;
  totalInvoices: number;
  paidAmount: number;
  pendingAmount: number;
  totalBilled: number;
  /** Latest activity date across quotations + invoices (yyyy-mm-dd). */
  lastServiceDate?: string;
  quotations: Quotation[];
  invoices: Invoice[];
}

function keyFor(name: string, phone: string): string {
  const p = phone.replace(/\D/g, "");
  return p || name.trim().toLowerCase() || "unknown";
}

/** Aggregates quotations + invoices into per-customer summaries. */
export const customerService = {
  async getAll(): Promise<CustomerSummary[]> {
    const db = getDb();
    const [quotations, invoices] = await Promise.all([
      db.quotations.toArray(),
      db.invoices.toArray(),
    ]);

    const map = new Map<string, CustomerSummary>();

    const ensure = (name: string, phone: string): CustomerSummary => {
      const key = keyFor(name, phone);
      let entry = map.get(key);
      if (!entry) {
        entry = {
          key,
          name: name || "Unknown",
          phone,
          totalQuotations: 0,
          totalInvoices: 0,
          paidAmount: 0,
          pendingAmount: 0,
          totalBilled: 0,
          quotations: [],
          invoices: [],
        };
        map.set(key, entry);
      }
      // Prefer a non-empty name/phone if we learn it later.
      if (!entry.name && name) entry.name = name;
      if (!entry.phone && phone) entry.phone = phone;
      return entry;
    };

    const bump = (entry: CustomerSummary, date?: string) => {
      if (date && (!entry.lastServiceDate || date > entry.lastServiceDate)) {
        entry.lastServiceDate = date;
      }
    };

    for (const q of quotations) {
      const e = ensure(q.customer.name, q.customer.phone);
      e.totalQuotations += 1;
      e.quotations.push(q);
      bump(e, q.date);
    }

    for (const inv of invoices) {
      const e = ensure(inv.customer.name, inv.customer.phone);
      e.totalInvoices += 1;
      e.invoices.push(inv);
      e.totalBilled += inv.totals.grandTotal;
      e.paidAmount += effectivePaidAmount(inv);
      e.pendingAmount += invoiceBalance(inv);
      bump(e, inv.date);
    }

    return Array.from(map.values()).sort((a, b) =>
      (b.lastServiceDate ?? "").localeCompare(a.lastServiceDate ?? "")
    );
  },

  async getByKey(key: string): Promise<CustomerSummary | undefined> {
    const all = await this.getAll();
    return all.find((c) => c.key === key);
  },
};
