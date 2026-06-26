import { getDb } from "@/db";
import type {
  Invoice,
  InvoiceStatus,
  PaymentStatus,
  Quotation,
  SortDirection,
} from "@/types";
import { calculateTotals, generateId } from "@/utils";
import { settingsService } from "./settings-service";

export type InvoiceSortField = "date" | "customer" | "createdAt" | "grandTotal";

export interface InvoiceDateRange {
  /** yyyy-mm-dd inclusive */
  from?: string;
  /** yyyy-mm-dd inclusive */
  to?: string;
}

export interface InvoiceQuery {
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  range?: InvoiceDateRange;
  sortField?: InvoiceSortField;
  sortDirection?: SortDirection;
}

/** Recomputes the totals snapshot on an invoice. */
function withFreshTotals(inv: Invoice): Invoice {
  return {
    ...inv,
    totals: calculateTotals({
      items: inv.items,
      charges: inv.charges,
      discount: inv.discount,
      gstPercent: inv.gstPercent,
    }),
  };
}

function inRange(date: string, range?: InvoiceDateRange): boolean {
  if (!range) return true;
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
}

/** Service for invoices / bills. */
export const invoiceService = {
  async getById(id: string): Promise<Invoice | undefined> {
    return getDb().invoices.get(id);
  },

  async getAll(query: InvoiceQuery = {}): Promise<Invoice[]> {
    let rows = await getDb().invoices.toArray();

    if (query.status) rows = rows.filter((i) => i.status === query.status);
    if (query.paymentStatus)
      rows = rows.filter((i) => i.paymentStatus === query.paymentStatus);
    rows = rows.filter((i) => inRange(i.date, query.range));

    if (query.search?.trim()) {
      const term = query.search.trim().toLowerCase();
      rows = rows.filter((i) =>
        [i.invoiceNumber, i.customer.name, i.customer.phone, i.date]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(term))
      );
    }

    const field = query.sortField ?? "createdAt";
    const dir = query.sortDirection ?? "desc";
    rows.sort((a, b) => {
      let cmp = 0;
      switch (field) {
        case "customer":
          cmp = a.customer.name.localeCompare(b.customer.name);
          break;
        case "grandTotal":
          cmp = a.totals.grandTotal - b.totals.grandTotal;
          break;
        case "date":
          cmp = a.date.localeCompare(b.date);
          break;
        default:
          cmp = a.createdAt.localeCompare(b.createdAt);
      }
      return dir === "asc" ? cmp : -cmp;
    });

    return rows;
  },

  async create(
    input: Omit<Invoice, "id" | "createdAt" | "updatedAt" | "totals"> & {
      totals?: Invoice["totals"];
    }
  ): Promise<Invoice> {
    const now = new Date().toISOString();
    const record = withFreshTotals({
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as Invoice);
    await getDb().invoices.put(record);
    return record;
  },

  async update(id: string, patch: Partial<Invoice>): Promise<Invoice> {
    const existing = await getDb().invoices.get(id);
    if (!existing) throw new Error(`Invoice ${id} not found`);
    const merged = withFreshTotals({
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    });
    await getDb().invoices.put(merged);
    return merged;
  },

  async remove(id: string): Promise<void> {
    await getDb().invoices.delete(id);
  },

  async duplicate(id: string): Promise<Invoice> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Invoice ${id} not found`);
    const number = await settingsService.consumeNextInvoiceNumber();
    const now = new Date().toISOString();
    const copy: Invoice = {
      ...existing,
      id: generateId(),
      invoiceNumber: number,
      status: "draft",
      paymentStatus: "unpaid",
      paidAmount: 0,
      sourceQuotationId: undefined,
      items: existing.items.map((it) => ({ ...it, id: generateId() })),
      createdAt: now,
      updatedAt: now,
    };
    await getDb().invoices.put(copy);
    return copy;
  },

  /**
   * Creates a new invoice from a quotation: copies customer, items, charges,
   * totals; assigns a fresh invoice number; defaults to unpaid.
   */
  async createFromQuotation(quotation: Quotation): Promise<Invoice> {
    const number = await settingsService.consumeNextInvoiceNumber();
    const settings = await settingsService.get();
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date();
    due.setDate(due.getDate() + (settings.defaultDueDays ?? 7));

    return this.create({
      invoiceNumber: number,
      status: "final",
      date: today,
      dueDate: due.toISOString().slice(0, 10),
      customer: { ...quotation.customer },
      items: quotation.items.map((it) => ({ ...it, id: generateId() })),
      charges: { ...quotation.charges },
      discount: quotation.discount,
      gstPercent: quotation.gstPercent,
      notes: quotation.notes,
      paymentStatus: "unpaid",
      paidAmount: 0,
      sourceQuotationId: quotation.id,
    });
  },

  async count(): Promise<number> {
    return getDb().invoices.count();
  },
};
