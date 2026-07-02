"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eraser,
  FileCheck2,
  LayoutTemplate,
  Save,
  SaveAll,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSection } from "./customer-section";
import { ChargesSection } from "./charges-section";
import { TotalsPanel } from "./totals-panel";
import { ItemsTable } from "@/components/tables/items-table";
import { TemplatePickerDialog } from "@/components/templates/template-picker-dialog";
import { SaveTemplateDialog } from "@/components/templates/save-template-dialog";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { useQuotationForm } from "@/hooks";
import { quotationService, settingsService } from "@/services";
import { ROUTES } from "@/lib/constants";
import type {
  AppSettings,
  Quotation,
  QuotationFormState,
  QuotationStatus,
  QuotationTemplate,
} from "@/types";
import { Package } from "lucide-react";

interface QuotationBuilderProps {
  settings: AppSettings;
  /** When provided, the builder edits this existing quotation. */
  existing?: Quotation;
  /** Auto quotation number for a brand-new quotation. */
  initialNumber?: string;
  /** When provided (new quotations), auto-loads this template once on mount. */
  autoTemplate?: QuotationTemplate;
}

/** Validates the working state before persisting. */
function validate(state: QuotationFormState): string | null {
  if (!state.customer.name.trim()) return "Enter the customer name.";
  const named = state.items.filter((i) => i.name.trim());
  if (named.length === 0) return "Add at least one item.";
  return null;
}

/** Builds the persistable payload from form state. */
function toPayload(state: QuotationFormState, status: QuotationStatus) {
  return {
    quotationNumber: state.quotationNumber,
    status,
    date: state.date,
    validTill: state.validTill || undefined,
    customer: {
      name: state.customer.name.trim(),
      phone: state.customer.phone.trim(),
      address: state.customer.address?.trim() || undefined,
    },
    items: state.items
      .filter((i) => i.name.trim())
      .map((i) => ({ ...i, name: i.name.trim() })),
    charges: state.charges,
    includeCharges: state.includeCharges,
    discount: state.discount,
    gstPercent: state.gstPercent,
    notes: state.notes.trim() || undefined,
  };
}

/**
 * The full quotation builder. Handles new + edit modes, template loading,
 * saving drafts/finals and saving templates.
 */
export function QuotationBuilder({
  settings,
  existing,
  initialNumber,
  autoTemplate,
}: QuotationBuilderProps) {
  const router = useRouter();
  const form = useQuotationForm(existing, {
    quotationNumber: initialNumber,
    gstPercent: settings.defaultGstPercent,
    validityDays: settings.defaultValidityDays,
  });

  // Auto-load a template once for brand-new quotations opened from "Use Template".
  const autoLoadedRef = React.useRef(false);
  React.useEffect(() => {
    if (!existing && autoTemplate && !autoLoadedRef.current) {
      autoLoadedRef.current = true;
      form.loadTemplate(autoTemplate);
      toast.success(`Loaded "${autoTemplate.name}".`);
    }
  }, [existing, autoTemplate, form]);

  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const { confirm, dialog } = useConfirm();

  const symbol = settings.currencySymbol;

  /** Persists the quotation with the given status, then navigates. */
  async function save(status: QuotationStatus) {
    const error = validate(form.state);
    if (error) {
      toast.error(error);
      return;
    }
    setBusy(true);
    try {
      const payload = toPayload(form.state, status);

      if (existing) {
        await quotationService.update(existing.id, payload);
        form.setDirty(false);
        toast.success(
          status === "final" ? "Quotation saved." : "Draft updated."
        );
        router.push(
          status === "final"
            ? `${ROUTES.quotations}/${existing.id}`
            : ROUTES.drafts
        );
        return;
      }

      // New quotation: assign an authoritative number from the sequence.
      const number = await settingsService.consumeNextNumber();
      const created = await quotationService.create({
        ...payload,
        quotationNumber: number,
      });
      form.setDirty(false);
      toast.success(
        status === "final" ? "Quotation created." : "Draft saved."
      );
      router.push(
        status === "final"
          ? `${ROUTES.quotations}/${created.id}`
          : ROUTES.drafts
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
      title: "Clear this quotation?",
      description: "All entered details will be discarded.",
      confirmLabel: "Clear",
      destructive: true,
    });
    if (ok) {
      form.reset({
        quotationNumber: initialNumber,
        gstPercent: settings.defaultGstPercent,
        validityDays: settings.defaultValidityDays,
      });
      toast.success("Form cleared.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setTemplatePickerOpen(true)}
        >
          <LayoutTemplate className="h-4 w-4" />
          Load Template
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setSaveTemplateOpen(true)}
        >
          <Package className="h-4 w-4" />
          Save as Template
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="ml-auto text-muted-foreground"
          onClick={handleClear}
        >
          <Eraser className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="space-y-6">
          <CustomerSection form={form} />

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
        </div>

        {/* Sticky summary sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <TotalsPanel
            totals={form.totals}
            gstPercent={form.state.gstPercent}
            currencySymbol={symbol}
          />
        </div>
      </div>

      {/* Sticky action bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-card/90 p-3 shadow-lg backdrop-blur"
      >
        <span className="mr-auto pl-2 text-sm text-muted-foreground">
          {form.state.quotationNumber || "New quotation"}
        </span>
        <Button
          type="button"
          variant="outline"
          onClick={() => save("draft")}
          disabled={busy}
        >
          <Save className="h-4 w-4" />
          {existing && existing.status === "draft"
            ? "Update Draft"
            : "Save Draft"}
        </Button>
        <Button type="button" onClick={() => save("final")} disabled={busy}>
          {existing ? (
            <SaveAll className="h-4 w-4" />
          ) : (
            <FileCheck2 className="h-4 w-4" />
          )}
          {existing && existing.status === "final"
            ? "Save Quotation"
            : "Save & Finalize"}
        </Button>
      </motion.div>

      <TemplatePickerDialog
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        onSelect={(tpl) => {
          form.loadTemplate(tpl);
          toast.success(`Loaded "${tpl.name}".`);
        }}
      />
      <SaveTemplateDialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        items={form.state.items}
        charges={form.state.charges}
        gstPercent={form.state.gstPercent}
      />
      {dialog}
    </div>
  );
}
