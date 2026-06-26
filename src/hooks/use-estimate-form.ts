"use client";

import * as React from "react";

import {
  EMPTY_CHARGES,
  type AdditionalCharges,
  type Estimate,
  type QuotationItem,
} from "@/types";
import { calculateTotals, computeItemAmount, generateId, todayISO } from "@/utils";
import { createEmptyItem } from "./use-quotation-form";

export interface EstimateFormState {
  estimateNumber: string;
  title: string;
  forName: string;
  date: string;
  items: QuotationItem[];
  charges: AdditionalCharges;
  discount: number;
  gstPercent: number;
  notes: string;
}

interface InitOptions {
  estimateNumber?: string;
  gstPercent?: number;
}

function createInitialState(opts: InitOptions = {}): EstimateFormState {
  return {
    estimateNumber: opts.estimateNumber ?? "",
    title: "",
    forName: "",
    date: todayISO(),
    items: [createEmptyItem()],
    charges: { ...EMPTY_CHARGES },
    discount: 0,
    gstPercent: opts.gstPercent ?? 0,
    notes: "",
  };
}

function fromEstimate(est: Estimate): EstimateFormState {
  return {
    estimateNumber: est.estimateNumber,
    title: est.title,
    forName: est.forName ?? "",
    date: est.date,
    items: est.items.length ? est.items.map((i) => ({ ...i })) : [createEmptyItem()],
    charges: { ...est.charges },
    discount: est.discount,
    gstPercent: est.gstPercent,
    notes: est.notes ?? "",
  };
}

/** Estimate builder state machine (lightweight costing sheet). */
export function useEstimateForm(existing?: Estimate, init?: InitOptions) {
  const [state, setState] = React.useState<EstimateFormState>(() =>
    existing ? fromEstimate(existing) : createInitialState(init)
  );
  const [dirty, setDirty] = React.useState(false);

  const patch = React.useCallback((partial: Partial<EstimateFormState>) => {
    setState((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  }, []);

  const reset = React.useCallback(
    (opts?: InitOptions) => {
      setState(createInitialState(opts ?? init));
      setDirty(false);
    },
    [init]
  );

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
      const copy: QuotationItem = { ...prev.items[index], id: generateId() };
      const items = [...prev.items];
      items.splice(index + 1, 0, copy);
      return { ...prev, items };
    });
    setDirty(true);
  }, []);

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

  const totals = React.useMemo(
    () =>
      calculateTotals({
        items: state.items,
        charges: state.charges,
        discount: state.discount,
        gstPercent: state.gstPercent,
      }),
    [state.items, state.charges, state.discount, state.gstPercent]
  );

  return {
    state,
    totals,
    dirty,
    setDirty,
    patch,
    reset,
    addItem,
    updateItem,
    removeItem,
    duplicateItem,
    setCharge,
  };
}

export type EstimateFormApi = ReturnType<typeof useEstimateForm>;
