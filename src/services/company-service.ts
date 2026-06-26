import { getDb } from "@/db";
import { COMPANY_PROFILE_ID, type CompanyProfile } from "@/types";

/** Service for the single business profile record. */
export const companyService = {
  async get(): Promise<CompanyProfile | undefined> {
    const db = getDb();
    return db.company.get(COMPANY_PROFILE_ID);
  },

  async save(
    data: Omit<CompanyProfile, "id" | "createdAt" | "updatedAt">
  ): Promise<CompanyProfile> {
    const db = getDb();
    const now = new Date().toISOString();
    const existing = await db.company.get(COMPANY_PROFILE_ID);
    const record: CompanyProfile = {
      ...data,
      id: COMPANY_PROFILE_ID,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await db.company.put(record);
    return record;
  },

  /** True when the minimum required fields are filled. */
  isComplete(profile?: CompanyProfile | null): boolean {
    return Boolean(
      profile && profile.companyName.trim() && profile.phone.trim()
    );
  },
};
