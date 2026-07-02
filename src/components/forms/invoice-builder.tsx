"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eraser, FileCheck2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceCustomerSection } from "./invoice-customer-section";
import { ChargesSection } from "./charges-section";
import { PaymentSection } from "./payment-section";
import { TotalsPanel } from "./totals-panel";
import { ItemsTable } from "@/components/tables/items-table";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { useInvoiceForm, type InvoiceFormState } from "@/hooks";
import { invoiceService, settingsService } from "@/services";
import { ROUTES } from "@/lib/constants";
import type { AppSettings, Invoice, InvoiceStatus } from "@/types";

interface InvoiceBuilderProps {
  settings: AppSettings;
  existing?: Invoice;
  initialNumber?: string;
}

function validate(state: InvoiceFormState): string | null {
  if (!state.customer.name.trim()) return "Enter the customer name.";
  if (state.items.filter((i) => i.name.trim()).length === 0)
    return "Add at least one item.";
  return null;
}

function toPayload(state: InvoiceFormState, status: InvoiceStatus) {
  return {
    invoiceNumber: state.invoiceNumber,
    status,
    date: state.date,
    dueDate: state.dueDate || undefined,
    customer: {
      name: state.customer.name.trim(),
      phone: state.customer.phone.trim(),
      address: state.customer.address?.trim() || undefined,
      gstNumber: state.customer.gstNumber?.trim() || undefined,
    },
    items: state.items
      .filter((i) => i.name.trim())
      .map((i) => ({ ...i, name: i.name.trim() })),
    charges: state.charges,
    includeCharges: state.includeCharges,
    discount: state.discount,
    gstPercent: state.gstPercent,
    notes: state.notes.trim() || undefined,
    paymentStatus: state.paymentStatus,
    paymentMethod: state.paymentMethod,
    paidAmount:
      state.paymentStatus === "partial" ? state.paidAmount : 0,
  };
}

/** Full invoice builder — new + edit modes with payment tracking. */
export function InvoiceBuilder({
  settings,
  existing,
  initialNumber,
}: InvoiceBuilderProps) {
  const router = useRouter();
  const form = useInvoiceForm(existing, {
    invoiceNumber: initialNumber,
    gstPercent: settings.defaultGstPercent,
    dueDays: settings.defaultDueDays,
  });
  const [busy, setBusy] = React.useState(false);
  const { confirm, dialog } = useConfirm();
  const symbol = settings.currencySymbol;

  async function save(status: InvoiceStatus) {
    const error = validate(form.state);
    if (error) {
      toast.error(error);
      return;
    }
    setBusy(true);
    try {
      const payload = toPayload(form.state, status);
      if (existing) {
        await invoiceService.update(existing.id, payload);
        form.setDirty(false);
        toast.success(
          status === "final" ? "Invoice / Bill saved." : "Draft updated."
        );
        router.push(
          status === "final"
            ? `${ROUTES.invoices}/${existing.id}`
            : `${ROUTES.invoices}?tab=drafts`
        );
        return;
      }
      const number = await settingsService.consumeNextInvoiceNumber();
      const created = await invoiceService.create({
        ...payload,
        invoiceNumber: number,
        paidAmount: payload.paidAmount,
      });
      form.setDirty(false);
      toast.success(
        status === "final" ? "Invoice / Bill created." : "Draft saved."
      );
      router.push(
        status === "final"
          ? `${ROUTES.invoices}/${created.id}`
          : `${ROUTES.invoices}?tab=drafts`
      );
    } catch (err) {
      console.error(err);
      toast.error("Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    const ok = await confirm({
      title: "Clear this invoice / bill?",
      description: "All entered details will be discarded.",
      confirmLabel: "Clear",
      destructive: true,
    });
    if (ok) {
      form.reset({
        invoiceNumber: initialNumber,
        gstPercent: settings.defaultGstPercent,
        dueDays: settings.defaultDueDays,
      });
      toast.success("Form cleared.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          className="ml-auto text-muted-foreground"
          onClick={handleClear}
        >
          <Eraser className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <InvoiceCustomerSection form={form} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemsTable
                items={form.state.items}
                currencySymbol={symbol}
                onAdd={form.addItem}
                onUpdate={form.updateItem}
                onRemove={form.removeItem}
                onDuplicate={form.duplicateItem}
              />
            </CardContent>
          </Card>

          <ChargesSection
            charges={form.state.charges}
            includeCharges={form.state.includeCharges}
            discount={form.state.discount}
            gstPercent={form.state.gstPercent}
            currencySymbol={symbol}
            onCharge={form.setCharge}
            onIncludeChange={(v) => form.patch({ includeCharges: v })}
            onDiscount={(v) => form.patch({ discount: v })}
            onGst={(v) => form.patch({ gstPercent: v })}
          />

          <PaymentSection form={form} currencySymbol={symbol} />
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <TotalsPanel
            totals={form.totals}
            gstPercent={form.state.gstPercent}
            currencySymbol={symbol}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-card/90 p-3 shadow-lg backdrop-blur"
      >
        <span className="mr-auto pl-2 text-sm text-muted-foreground">
          {form.state.invoiceNumber || "New invoice / bill"}
        </span>
        <Button variant="outline" onClick={() => save("draft")} disabled={busy}>
          <Save className="h-4 w-4" />
          {existing && existing.status === "draft" ? "Update Draft" : "Save Draft"}
        </Button>
        <Button onClick={() => save("final")} disabled={busy}>
          <FileCheck2 className="h-4 w-4" />
          {existing && existing.status === "final"
            ? "Save Invoice / Bill"
            : "Save & Generate"}
        </Button>
      </motion.div>

      {dialog}
    </div>
  );
}
