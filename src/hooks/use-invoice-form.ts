"use client";

import * as React from "react";

import {
  EMPTY_CHARGES,
  type AdditionalCharges,
  type Invoice,
  type InvoiceCustomer,
  type PaymentMethod,
  type PaymentStatus,
  type QuotationItem,
} from "@/types";
import { calculateTotals, computeItemAmount, generateId } from "@/utils";
import { addDays, todayISO } from "@/utils";
import { createEmptyItem } from "./use-quotation-form";

export interface InvoiceFormState {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customer: InvoiceCustomer;
  items: QuotationItem[];
  charges: AdditionalCharges;
  discount: number;
  gstPercent: number;
  notes: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAmount: number;
}

interface InitOptions {
  invoiceNumber?: string;
  gstPercent?: number;
  dueDays?: number;
}

function createInitialState(opts: InitOptions = {}): InvoiceFormState {
  const date = todayISO();
  return {
    invoiceNumber: opts.invoiceNumber ?? "",
    date,
    dueDate: addDays(date, opts.dueDays ?? 7),
    customer: { name: "", phone: "", address: "", gstNumber: "" },
    items: [createEmptyItem()],
    charges: { ...EMPTY_CHARGES },
    discount: 0,
    gstPercent: opts.gstPercent ?? 18,
    notes: "",
    paymentStatus: "unpaid",
    paymentMethod: undefined,
    paidAmount: 0,
  };
}

function fromInvoice(inv: Invoice): InvoiceFormState {
  return {
    invoiceNumber: inv.invoiceNumber,
    date: inv.date,
    dueDate: inv.dueDate ?? "",
    customer: { ...inv.customer },
    items: inv.items.length ? inv.items.map((i) => ({ ...i })) : [createEmptyItem()],
    charges: { ...inv.charges },
    discount: inv.discount,
    gstPercent: inv.gstPercent,
    notes: inv.notes ?? "",
    paymentStatus: inv.paymentStatus,
    paymentMethod: inv.paymentMethod,
    paidAmount: inv.paidAmount,
  };
}

/** Invoice builder state machine (mirrors the quotation form + payment fields). */
export function useInvoiceForm(existing?: Invoice, init?: InitOptions) {
  const [state, setState] = React.useState<InvoiceFormState>(() =>
    existing ? fromInvoice(existing) : createInitialState(init)
  );
  const [dirty, setDirty] = React.useState(false);

  const patch = React.useCallback((partial: Partial<InvoiceFormState>) => {
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

  const setCustomer = React.useCallback(
    (field: keyof InvoiceCustomer, value: string) => {
      setState((prev) => ({
        ...prev,
        customer: { ...prev.customer, [field]: value },
      }));
      setDirty(true);
    },
    []
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
    setCustomer,
    addItem,
    updateItem,
    removeItem,
    duplicateItem,
    setCharge,
  };
}

export type InvoiceFormApi = ReturnType<typeof useInvoiceForm>;
