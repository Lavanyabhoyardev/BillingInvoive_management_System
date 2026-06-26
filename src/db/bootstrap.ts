import {
  APP_SETTINGS_ID,
  COMPANY_PROFILE_ID,
  DEFAULT_SETTINGS,
  type AppSettings,
  type CompanyProfile,
} from "@/types";
import { getDb } from "./database";
import { buildSeedTemplateRecords } from "./seed-templates";

const BOOTSTRAP_FLAG = "qm:bootstrapped:v1";

/**
 * Ensures the database has its baseline records on first run:
 *  - default app settings
 *  - empty company profile stub
 *  - seeded example templates
 *
 * Idempotent: safe to call on every app load. Uses a localStorage flag to
 * avoid re-seeding templates the user may have deleted.
 */
export async function bootstrapDatabase(): Promise<void> {
  if (typeof window === "undefined") return;
  const db = getDb();
  const now = new Date().toISOString();

  // 1. Settings
  const settings = await db.settings.get(APP_SETTINGS_ID);
  if (!settings) {
    const record: AppSettings = {
      id: APP_SETTINGS_ID,
      ...DEFAULT_SETTINGS,
      createdAt: now,
      updatedAt: now,
    };
    await db.settings.add(record);
  }

  // 2. Company profile stub
  const company = await db.company.get(COMPANY_PROFILE_ID);
  if (!company) {
    const record: CompanyProfile = {
      id: COMPANY_PROFILE_ID,
      companyName: "",
      ownerName: "",
      phone: "",
      address: "",
      createdAt: now,
      updatedAt: now,
    };
    await db.company.add(record);
  }

  // 3. Seed templates (only once, tracked by localStorage flag)
  const alreadySeeded = window.localStorage.getItem(BOOTSTRAP_FLAG);
  const templateCount = await db.templates.count();
  if (!alreadySeeded && templateCount === 0) {
    await db.templates.bulkAdd(buildSeedTemplateRecords());
    window.localStorage.setItem(BOOTSTRAP_FLAG, "true");
  }
}
