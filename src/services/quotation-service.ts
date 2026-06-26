import { getDb } from "@/db";
import type { Quotation, QuotationStatus, SortDirection } from "@/types";
import { calculateTotals, generateId } from "@/utils";
import { settingsService } from "./settings-service";

export type QuotationSortField = "date" | "customer" | "createdAt" | "grandTotal";

export interface QuotationQuery {
  status?: QuotationStatus;
  search?: string;
  sortField?: QuotationSortField;
  sortDirection?: SortDirection;
}

/** Recomputes and refreshes the totals snapshot on a quotation. */
function withFreshTotals(q: Quotation): Quotation {
  return {
    ...q,
    totals: calculateTotals({
      items: q.items,
      charges: q.charges,
      discount: q.discount,
      gstPercent: q.gstPercent,
    }),
  };
}

/** Service for quotations and drafts (same table, separated by `status`). */
export const quotationService = {
  async getById(id: string): Promise<Quotation | undefined> {
    const db = getDb();
    return db.quotations.get(id);
  },

  async getAll(query: QuotationQuery = {}): Promise<Quotation[]> {
    const db = getDb();
    let rows = await db.quotations.toArray();

    if (query.status) {
      rows = rows.filter((q) => q.status === query.status);
    }

    if (query.search?.trim()) {
      const term = query.search.trim().toLowerCase();
      rows = rows.filter((q) =>
        [
          q.quotationNumber,
          q.customer.name,
          q.customer.phone,
          q.date,
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(term))
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

  /** Creates a new quotation/draft. Generates id and assigns a real number for finals. */
  async create(
    input: Omit<Quotation, "id" | "createdAt" | "updatedAt" | "totals"> & {
      totals?: Quotation["totals"];
    }
  ): Promise<Quotation> {
    const db = getDb();
    const now = new Date().toISOString();
    const record = withFreshTotals({
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as Quotation);
    await db.quotations.put(record);
    return record;
  },

  /** Updates an existing quotation, refreshing totals and timestamp. */
  async update(id: string, patch: Partial<Quotation>): Promise<Quotation> {
    const db = getDb();
    const existing = await db.quotations.get(id);
    if (!existing) throw new Error(`Quotation ${id} not found`);
    const merged = withFreshTotals({
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    });
    await db.quotations.put(merged);
    return merged;
  },

  async remove(id: string): Promise<void> {
    const db = getDb();
    await db.quotations.delete(id);
  },

  /** Deep-duplicates a quotation as a new draft with regenerated ids. */
  async duplicate(id: string): Promise<Quotation> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Quotation ${id} not found`);
    const now = new Date().toISOString();
    const copy: Quotation = {
      ...existing,
      id: generateId(),
      status: "draft",
      quotationNumber: `${existing.quotationNumber}-COPY`,
      items: existing.items.map((it) => ({ ...it, id: generateId() })),
      createdAt: now,
      updatedAt: now,
    };
    const db = getDb();
    await db.quotations.put(copy);
    return copy;
  },

  /**
   * Converts a draft into a finalized quotation. Keeps the existing quotation
   * number (drafts already receive one on creation); only assigns a fresh
   * number from the sequence if it is somehow missing.
   */
  async convertToFinal(id: string): Promise<Quotation> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Quotation ${id} not found`);
    const number = existing.quotationNumber?.trim()
      ? existing.quotationNumber
      : await settingsService.consumeNextNumber();
    return this.update(id, { status: "final", quotationNumber: number });
  },

  async count(status?: QuotationStatus): Promise<number> {
    const db = getDb();
    if (!status) return db.quotations.count();
    return db.quotations.where("status").equals(status).count();
  },
};
