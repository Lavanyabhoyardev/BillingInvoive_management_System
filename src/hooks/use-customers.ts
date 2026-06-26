"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { customerService, type CustomerSummary } from "@/services";

/** Reactive list of aggregated customer summaries. */
export function useCustomers(): {
  customers: CustomerSummary[];
  isLoading: boolean;
} {
  const customers = useLiveQuery(() => customerService.getAll(), [], undefined);
  return { customers: customers ?? [], isLoading: customers === undefined };
}

/** Reactive single customer summary by key. */
export function useCustomer(key?: string): {
  customer: CustomerSummary | undefined;
  isLoading: boolean;
} {
  const customer = useLiveQuery(
    () => (key ? customerService.getByKey(key) : undefined),
    [key],
    undefined
  );
  return { customer, isLoading: Boolean(key) && customer === undefined };
}
