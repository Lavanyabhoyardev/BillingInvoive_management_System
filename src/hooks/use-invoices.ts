"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/db";
import { invoiceService, type InvoiceQuery } from "@/services";
import type { Invoice } from "@/types";

/** Reactive list of invoices with filters/search/sort applied. */
export function useInvoices(query: InvoiceQuery = {}): {
  invoices: Invoice[];
  isLoading: boolean;
} {
  const invoices = useLiveQuery(
    () => invoiceService.getAll(query),
    [
      query.status,
      query.paymentStatus,
      query.search,
      query.range?.from,
      query.range?.to,
      query.sortField,
      query.sortDirection,
    ],
    undefined
  );
  return { invoices: invoices ?? [], isLoading: invoices === undefined };
}

/** Reactive single invoice by id. */
export function useInvoice(id?: string): {
  invoice: Invoice | undefined;
  isLoading: boolean;
} {
  const invoice = useLiveQuery(
    () => (id ? getDb().invoices.get(id) : undefined),
    [id],
    undefined
  );
  return { invoice, isLoading: Boolean(id) && invoice === undefined };
}
