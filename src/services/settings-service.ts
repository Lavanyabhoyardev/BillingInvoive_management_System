import { getDb } from "@/db";
import {
  APP_SETTINGS_ID,
  DEFAULT_SETTINGS,
  type AppSettings,
} from "@/types";

/** Service for app-level settings and document numbering. */
export const settingsService = {
  async get(): Promise<AppSettings> {
    const db = getDb();
    const now = new Date().toISOString();
    const existing = await db.settings.get(APP_SETTINGS_ID);
    if (existing) {
      // Backfill any keys added in later versions (invoice/estimate numbering).
      const merged: AppSettings = {
        ...DEFAULT_SETTINGS,
        ...existing,
        id: APP_SETTINGS_ID,
      };
      return merged;
    }
    const record: AppSettings = {
      id: APP_SETTINGS_ID,
      ...DEFAULT_SETTINGS,
      createdAt: now,
      updatedAt: now,
    };
    await db.settings.put(record);
    return record;
  },

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const db = getDb();
    const current = await this.get();
    const updated: AppSettings = {
      ...current,
      ...patch,
      id: APP_SETTINGS_ID,
      updatedAt: new Date().toISOString(),
    };
    await db.settings.put(updated);
    return updated;
  },

  // ---- Quotation numbering ----
  async peekNextNumber(): Promise<string> {
    const settings = await this.get();
    return formatDocNumber(settings.quotationPrefix, settings.lastSequence + 1);
  },
  async consumeNextNumber(): Promise<string> {
    const settings = await this.get();
    const next = settings.lastSequence + 1;
    await this.update({ lastSequence: next });
    return formatDocNumber(settings.quotationPrefix, next);
  },

  // ---- Invoice numbering ----
  async peekNextInvoiceNumber(): Promise<string> {
    const settings = await this.get();
    return formatDocNumber(
      settings.invoicePrefix,
      settings.lastInvoiceSequence + 1
    );
  },
  async consumeNextInvoiceNumber(): Promise<string> {
    const settings = await this.get();
    const next = settings.lastInvoiceSequence + 1;
    await this.update({ lastInvoiceSequence: next });
    return formatDocNumber(settings.invoicePrefix, next);
  },

  // ---- Estimate numbering ----
  async peekNextEstimateNumber(): Promise<string> {
    const settings = await this.get();
    return formatDocNumber(
      settings.estimatePrefix,
      settings.lastEstimateSequence + 1
    );
  },
  async consumeNextEstimateNumber(): Promise<string> {
    const settings = await this.get();
    const next = settings.lastEstimateSequence + 1;
    await this.update({ lastEstimateSequence: next });
    return formatDocNumber(settings.estimatePrefix, next);
  },
};

/** Builds a document number string with year and zero-padded sequence. */
export function formatDocNumber(prefix: string, sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, "0");
  return `${prefix}-${year}-${padded}`;
}

/** @deprecated use formatDocNumber */
export const formatQuotationNumber = formatDocNumber;
