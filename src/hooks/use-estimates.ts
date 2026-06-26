"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/db";
import { estimateService, type EstimateQuery } from "@/services";
import type { Estimate } from "@/types";

/** Reactive list of estimates. */
export function useEstimates(query: EstimateQuery = {}): {
  estimates: Estimate[];
  isLoading: boolean;
} {
  const estimates = useLiveQuery(
    () => estimateService.getAll(query),
    [query.search, query.sortField, query.sortDirection],
    undefined
  );
  return { estimates: estimates ?? [], isLoading: estimates === undefined };
}

/** Reactive single estimate by id. */
export function useEstimate(id?: string): {
  estimate: Estimate | undefined;
  isLoading: boolean;
} {
  const estimate = useLiveQuery(
    () => (id ? getDb().estimates.get(id) : undefined),
    [id],
    undefined
  );
  return { estimate, isLoading: Boolean(id) && estimate === undefined };
}
