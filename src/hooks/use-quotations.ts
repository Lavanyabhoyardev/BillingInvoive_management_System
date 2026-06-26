"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/db";
import { quotationService, type QuotationQuery } from "@/services";
import type { Quotation } from "@/types";

/**
 * Reactive list of quotations/drafts with search & sort applied in-memory.
 * Re-runs automatically whenever the quotations table changes.
 */
export function useQuotations(query: QuotationQuery = {}): {
  quotations: Quotation[];
  isLoading: boolean;
} {
  const quotations = useLiveQuery(
    () => quotationService.getAll(query),
    [query.status, query.search, query.sortField, query.sortDirection],
    undefined
  );
  return { quotations: quotations ?? [], isLoading: quotations === undefined };
}

/** Reactive single quotation by id. */
export function useQuotation(id?: string): {
  quotation: Quotation | undefined;
  isLoading: boolean;
} {
  const quotation = useLiveQuery(
    () => (id ? getDb().quotations.get(id) : undefined),
    [id],
    undefined
  );
  return {
    quotation,
    isLoading: Boolean(id) && quotation === undefined,
  };
}
