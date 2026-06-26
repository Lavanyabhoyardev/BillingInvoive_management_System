"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/db";

export interface DashboardStats {
  totalQuotations: number;
  draftQuotations: number;
  finalQuotations: number;
  templates: number;
  totalQuotedValue: number;
}

/** Reactive aggregate stats for the dashboard cards. */
export function useDashboardStats(): {
  stats: DashboardStats | undefined;
  isLoading: boolean;
} {
  const stats = useLiveQuery(async () => {
    const db = getDb();
    const all = await db.quotations.toArray();
    const templates = await db.templates.count();
    const draftQuotations = all.filter((q) => q.status === "draft").length;
    const finalQuotations = all.filter((q) => q.status === "final").length;
    const totalQuotedValue = all.reduce(
      (sum, q) => sum + (q.totals?.grandTotal ?? 0),
      0
    );
    return {
      totalQuotations: all.length,
      draftQuotations,
      finalQuotations,
      templates,
      totalQuotedValue,
    };
  }, []);

  return { stats, isLoading: stats === undefined };
}
