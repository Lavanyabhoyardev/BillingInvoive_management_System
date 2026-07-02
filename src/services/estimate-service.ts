import { getDb } from "@/db";
import type { Estimate, SortDirection } from "@/types";
import { calculateTotals, generateId } from "@/utils";
import { settingsService } from "./settings-service";

export type EstimateSortField = "date" | "title" | "createdAt" | "grandTotal";

export interface EstimateQuery {
  search?: string;
  sortField?: EstimateSortField;
  sortDirection?: SortDirection;
}

function withFreshTotals(est: Estimate): Estimate {
  return {
    ...est,
    totals: calculateTotals({
      items: est.items,
      charges: est.charges,
      discount: est.discount,
      gstPercent: est.gstPercent,
      includeCharges: est.includeCharges,
    }),
  };
}

/** Service for lightweight cost estimates. */
export const estimateService = {
  async getById(id: string): Promise<Estimate | undefined> {
    return getDb().estimates.get(id);
  },

  async getAll(query: EstimateQuery = {}): Promise<Estimate[]> {
    let rows = await getDb().estimates.toArray();

    if (query.search?.trim()) {
      const term = query.search.trim().toLowerCase();
      rows = rows.filter((e) =>
        [e.estimateNumber, e.title, e.forName ?? "", e.date]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(term))
      );
    }

    const field = query.sortField ?? "createdAt";
    const dir = query.sortDirection ?? "desc";
    rows.sort((a, b) => {
      let cmp = 0;
      switch (field) {
        case "title":
          cmp = a.title.localeCompare(b.title);
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
    input: Omit<Estimate, "id" | "createdAt" | "updatedAt" | "totals"> & {
      totals?: Estimate["totals"];
    }
  ): Promise<Estimate> {
    const now = new Date().toISOString();
    const record = withFreshTotals({
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as Estimate);
    await getDb().estimates.put(record);
    return record;
  },

  async update(id: string, patch: Partial<Estimate>): Promise<Estimate> {
    const existing = await getDb().estimates.get(id);
    if (!existing) throw new Error(`Estimate ${id} not found`);
    const merged = withFreshTotals({
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    });
    await getDb().estimates.put(merged);
    return merged;
  },

  async remove(id: string): Promise<void> {
    await getDb().estimates.delete(id);
  },

  async duplicate(id: string): Promise<Estimate> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Estimate ${id} not found`);
    const number = await settingsService.consumeNextEstimateNumber();
    const now = new Date().toISOString();
    const copy: Estimate = {
      ...existing,
      id: generateId(),
      estimateNumber: number,
      title: `${existing.title} (Copy)`,
      items: existing.items.map((it) => ({ ...it, id: generateId() })),
      createdAt: now,
      updatedAt: now,
    };
    await getDb().estimates.put(copy);
    return copy;
  },

  async count(): Promise<number> {
    return getDb().estimates.count();
  },
};
