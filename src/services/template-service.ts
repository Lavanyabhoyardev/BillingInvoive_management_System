import { getDb } from "@/db";
import type { QuotationTemplate } from "@/types";
import { generateId } from "@/utils";

/** Service for reusable quotation templates. */
export const templateService = {
  async getById(id: string): Promise<QuotationTemplate | undefined> {
    const db = getDb();
    return db.templates.get(id);
  },

  async getAll(search?: string): Promise<QuotationTemplate[]> {
    const db = getDb();
    let rows = await db.templates.orderBy("name").toArray();
    if (search?.trim()) {
      const term = search.trim().toLowerCase();
      rows = rows.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          (t.category ?? "").toLowerCase().includes(term)
      );
    }
    return rows;
  },

  async create(
    input: Omit<QuotationTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<QuotationTemplate> {
    const db = getDb();
    const now = new Date().toISOString();
    const record: QuotationTemplate = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.templates.put(record);
    return record;
  },

  async update(
    id: string,
    patch: Partial<QuotationTemplate>
  ): Promise<QuotationTemplate> {
    const db = getDb();
    const existing = await db.templates.get(id);
    if (!existing) throw new Error(`Template ${id} not found`);
    const merged: QuotationTemplate = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.templates.put(merged);
    return merged;
  },

  async remove(id: string): Promise<void> {
    const db = getDb();
    await db.templates.delete(id);
  },

  async duplicate(id: string): Promise<QuotationTemplate> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Template ${id} not found`);
    return this.create({
      ...existing,
      name: `${existing.name} (Copy)`,
      isSeed: false,
      items: existing.items.map((it) => ({ ...it, id: generateId() })),
    });
  },

  async count(): Promise<number> {
    const db = getDb();
    return db.templates.count();
  },
};
