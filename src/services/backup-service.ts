import { getDb } from "@/db";
import {
  APP_SETTINGS_ID,
  COMPANY_PROFILE_ID,
  type AppSettings,
  type CompanyProfile,
  type Estimate,
  type Invoice,
  type Quotation,
  type QuotationTemplate,
} from "@/types";

/** Shape of a full backup file. */
export interface BackupData {
  app: "QuoteDesk";
  version: 2;
  exportedAt: string;
  company?: CompanyProfile;
  settings?: AppSettings;
  quotations: Quotation[];
  templates: QuotationTemplate[];
  invoices: Invoice[];
  estimates: Estimate[];
}

export type ImportMode = "merge" | "replace";

/** Service to export/import the entire database as a single JSON file. */
export const backupService = {
  /** Collects every table into one serializable object. */
  async export(): Promise<BackupData> {
    const db = getDb();
    const [company, settings, quotations, templates, invoices, estimates] =
      await Promise.all([
        db.company.get(COMPANY_PROFILE_ID),
        db.settings.get(APP_SETTINGS_ID),
        db.quotations.toArray(),
        db.templates.toArray(),
        db.invoices.toArray(),
        db.estimates.toArray(),
      ]);

    return {
      app: "QuoteDesk",
      version: 2,
      exportedAt: new Date().toISOString(),
      company,
      settings,
      quotations,
      templates,
      invoices,
      estimates,
    };
  },

  /** Validates a parsed object is a QuoteDesk backup. */
  isValid(data: unknown): data is BackupData {
    if (!data || typeof data !== "object") return false;
    const d = data as Partial<BackupData>;
    return d.app === "QuoteDesk" && Array.isArray(d.quotations);
  },

  /**
   * Restores data from a backup.
   *  - "replace": clears existing records first (full restore).
   *  - "merge":   keeps existing records, adds/overwrites by id.
   */
  async import(data: BackupData, mode: ImportMode = "merge"): Promise<void> {
    const db = getDb();
    await db.transaction(
      "rw",
      [db.company, db.settings, db.quotations, db.templates, db.invoices, db.estimates],
      async () => {
        if (mode === "replace") {
          await Promise.all([
            db.quotations.clear(),
            db.templates.clear(),
            db.invoices.clear(),
            db.estimates.clear(),
          ]);
        }
        if (data.company) await db.company.put(data.company);
        if (data.settings) await db.settings.put(data.settings);
        if (data.quotations?.length) await db.quotations.bulkPut(data.quotations);
        if (data.templates?.length) await db.templates.bulkPut(data.templates);
        if (data.invoices?.length) await db.invoices.bulkPut(data.invoices);
        if (data.estimates?.length) await db.estimates.bulkPut(data.estimates);
      }
    );
  },

  /** Deletes ALL data (factory reset). */
  async clearAll(): Promise<void> {
    const db = getDb();
    await Promise.all([
      db.quotations.clear(),
      db.templates.clear(),
      db.invoices.clear(),
      db.estimates.clear(),
    ]);
  },
};
