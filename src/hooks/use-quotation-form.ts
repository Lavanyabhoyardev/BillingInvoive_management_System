"use client";

import * as React from "react";

import {
  EMPTY_CHARGES,
  type AdditionalCharges,
  type CustomerDetails,
  type ItemUnit,
  type Quotation,
  type QuotationFormState,
  type QuotationItem,
  type QuotationTemplate,
} from "@/types";
import { calculateTotals, computeItemAmount, generateId } from "@/utils";
import { addDays, todayISO } from "@/utils";

/** Creates a single blank line item. */
export function createEmptyItem(): QuotationItem {
  return {
    id: generateId(),
    name: "",
    description: "",
    quantity: 1,
    unit: "Nos" as ItemUnit,
    price: 0,
    amount: 0,
  };
}

interface InitOptions {
  quotationNumber?: string;
  gstPercent?: number;
  validityDays?: number;
}

function createInitialState(opts: InitOptions = {}): QuotationFormState {
  const date = todayISO();
  return {
    quotationNumber: opts.quotationNumber ?? "",
    date,
    validTill: addDays(date, opts.validityDays ?? 15),
    customer: { name: "", phone: "", address: "" },
    items: [createEmptyItem()],
    charges: { ...EMPTY_CHARGES },
    includeCharges: true,
    discount: 0,
    gstPercent: opts.gstPercent ?? 18,
    notes: "",
  };
}

/** Maps a persisted Quotation into editable form state. */
function fromQuotation(q: Quotation): QuotationFormState {
  return {
    quotationNumber: q.quotationNumber,
    date: q.date,
    validTill: q.validTill ?? "",
    customer: { ...q.customer },
    items: q.items.length ? q.items.map((i) => ({ ...i })) : [createEmptyItem()],
    charges: { ...q.charges },
    includeCharges: q.includeCharges !== false,
    discount: q.discount,
    gstPercent: q.gstPercent,
    notes: q.notes ?? "",
  };
}

/**
 * Quotation builder state machine. Owns the working form state, exposes typed
 * mutators for every section, and derives live totals on each render.
 */
export function useQuotationForm(existing?: Quotation, init?: InitOptions) {
  const [state, setState] = React.useState<QuotationFormState>(() =>
    existing ? fromQuotation(existing) : createInitialState(init)
  );
  const [dirty, setDirty] = React.useState(false);

  const patch = React.useCallback((partial: Partial<QuotationFormState>) => {
    setState((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  }, []);

  /** Resets the whole form (e.g. "Clear"). */
  const reset = React.useCallback(
    (opts?: InitOptions) => {
      setState(createInitialState(opts ?? init));
      setDirty(false);
    },
    [init]
  );

  /** Replaces state from a loaded quotation. */
  const hydrate = React.useCallback((q: Quotation) => {
    setState(fromQuotation(q));
    setDirty(false);
  }, []);

  // ---- Customer ----
  const setCustomer = React.useCallback(
    (field: keyof CustomerDetails, value: string) => {
      setState((prev) => ({
        ...prev,
        customer: { ...prev.customer, [field]: value },
      }));
      setDirty(true);
    },
    []
  );

  // ---- Items ----
  const addItem = React.useCallback(() => {
    setState((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }));
    setDirty(true);
  }, []);

  const updateItem = React.useCallback(
    (id: string, changes: Partial<QuotationItem>) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) => {
          if (item.id !== id) return item;
          const next = { ...item, ...changes };
          next.amount = computeItemAmount(next.quantity, next.price);
          return next;
        }),
      }));
      setDirty(true);
    },
    []
  );

  const removeItem = React.useCallback((id: string) => {
    setState((prev) => {
      const remaining = prev.items.filter((i) => i.id !== id);
      return {
        ...prev,
        items: remaining.length ? remaining : [createEmptyItem()],
      };
    });
    setDirty(true);
  }, []);

  const duplicateItem = React.useCallback((id: string) => {
    setState((prev) => {
      const index = prev.items.findIndex((i) => i.id === id);
      if (index === -1) return prev;
      const copy: QuotationItem = {
        ...prev.items[index],
        id: generateId(),
      };
      const items = [...prev.items];
      items.splice(index + 1, 0, copy);
      return { ...prev, items };
    });
    setDirty(true);
  }, []);

  // ---- Charges / discount / gst ----
  const setCharge = React.useCallback(
    (field: keyof AdditionalCharges, value: number) => {
      setState((prev) => ({
        ...prev,
        charges: { ...prev.charges, [field]: value },
      }));
      setDirty(true);
    },
    []
  );

  // ---- Templates ----
  const loadTemplate = React.useCallback((template: QuotationTemplate) => {
    setState((prev) => ({
      ...prev,
      items: template.items.map((it) => ({
        ...it,
        id: generateId(),
        amount: computeItemAmount(it.quantity, it.price),
      })),
      charges: { ...EMPTY_CHARGES, ...template.charges },
      gstPercent: template.gstPercent,
    }));
    setDirty(true);
  }, []);

  // ---- Derived totals (single source of truth) ----
  const totals = React.useMemo(
    () =>
      calculateTotals({
        items: state.items,
        charges: state.charges,
        discount: state.discount,
        gstPercent: state.gstPercent,
        includeCharges: state.includeCharges,
      }),
    [
      state.items,
      state.charges,
      state.discount,
      state.gstPercent,
      state.includeCharges,
    ]
  );

  return {
    state,
    totals,
    dirty,
    setDirty,
    patch,
    reset,
    hydrate,
    setCustomer,
    addItem,
    updateItem,
    removeItem,
    duplicateItem,
    setCharge,
    loadTemplate,
  };
}

export type QuotationFormApi = ReturnType<typeof useQuotationForm>;
