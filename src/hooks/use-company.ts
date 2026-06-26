"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/db";
import { COMPANY_PROFILE_ID, type CompanyProfile } from "@/types";

/** Reactive access to the company profile. Re-renders on any change. */
export function useCompany(): {
  company: CompanyProfile | undefined;
  isLoading: boolean;
} {
  const company = useLiveQuery(
    () => getDb().company.get(COMPANY_PROFILE_ID),
    [],
    undefined
  );
  return { company, isLoading: company === undefined };
}
