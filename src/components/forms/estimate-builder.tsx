"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calculator, Eraser, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./form-field";
import { ChargesSection } from "./charges-section";
import { TotalsPanel } from "./totals-panel";
import { ItemsTable } from "@/components/tables/items-table";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { useEstimateForm, type EstimateFormState } from "@/hooks";
import { estimateService, settingsService } from "@/services";
import { ROUTES } from "@/lib/constants";
import type { AppSettings, Estimate } from "@/types";

interface EstimateBuilderProps {
  settings: AppSettings;
  existing?: Estimate;
  initialNumber?: string;
}

function validate(state: EstimateFormState): string | null {
  if (!state.title.trim()) return "Enter what you're estimating (a title).";
  if (state.items.filter((i) => i.name.trim()).length === 0)
    return "Add at least one item.";
  return null;
}

/** Lightweight estimate/costing builder. */
export function EstimateBuilder({
  settings,
  existing,
  initialNumber,
}: EstimateBuilderProps) {
  const router = useRouter();
  const form = useEstimateForm(existing, {
    estimateNumber: initialNumber,
    gstPercent: 0,
  });
  const [busy, setBusy] = React.useState(false);
  const { confirm, dialog } = useConfirm();
  const symbol = settings.currencySymbol;

  async function handleSave() {
    const error = validate(form.state);
    if (error) {
      toast.error(error);
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.state.title.trim(),
        forName: form.state.forName.trim() || undefined,
        date: form.state.date,
        items: form.state.items
          .filter((i) => i.name.trim())
          .map((i) => ({ ...i, name: i.name.trim() })),
        charges: form.state.charges,
        includeCharges: form.state.includeCharges,
        discount: form.state.discount,
        gstPercent: form.state.gstPercent,
        notes: form.state.notes.trim() || undefined,
      };

      if (existing) {
        await estimateService.update(existing.id, payload);
        form.setDirty(false);
        toast.success("Estimate saved.");
        router.push(`${ROUTES.estimates}/${existing.id}`);
        return;
      }
      const number = await settingsService.consumeNextEstimateNumber();
      const created = await estimateService.create({
        ...payload,
        estimateNumber: number,
      });
      form.setDirty(false);
      toast.success("Estimate saved.");
      router.push(`${ROUTES.estimates}/${created.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    const ok = await confirm({
      title: "Clear this estimate?",
      description: "All entered details will be discarded.",
      confirmLabel: "Clear",
      destructive: true,
    });
    if (ok) {
      form.reset({ estimateNumber: initialNumber, gstPercent: 0 });
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4 text-primary" />
                Estimate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Estimate For" required hint="What is this estimate for?">
                  <Input
                    placeholder="e.g. Gaming PC Build, Office CCTV"
                    value={form.state.title}
                    onChange={(e) => form.patch({ title: e.target.value })}
                  />
                </FormField>
                <FormField label="Customer / Reference">
                  <Input
                    placeholder="Optional name"
                    value={form.state.forName}
                    onChange={(e) => form.patch({ forName: e.target.value })}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Estimate No.">
                  <Input
                    value={form.state.estimateNumber}
                    onChange={(e) =>
                      form.patch({ estimateNumber: e.target.value })
                    }
                    className="font-medium"
                  />
                </FormField>
                <FormField label="Date">
                  <Input
                    type="date"
                    value={form.state.date}
                    onChange={(e) => form.patch({ date: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="Notes">
                <Textarea
                  rows={2}
                  placeholder="Any note (optional)"
                  value={form.state.notes}
                  onChange={(e) => form.patch({ notes: e.target.value })}
                />
              </FormField>
            </CardContent>
          </Card>

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
          {form.state.estimateNumber || "New estimate"}
        </span>
        <Button onClick={handleSave} disabled={busy}>
          <Save className="h-4 w-4" />
          Save Estimate
        </Button>
      </motion.div>

      {dialog}
    </div>
  );
}
