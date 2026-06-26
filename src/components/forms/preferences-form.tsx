"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { settingsService } from "@/services";
import type { AppSettings } from "@/types";

interface PreferencesFormProps {
  initial: AppSettings;
}

interface PrefsValues {
  currencySymbol: string;
  currencyCode: string;
  quotationPrefix: string;
  defaultGstPercent: number;
  defaultValidityDays: number;
  lastSequence: number;
}

/** App preferences: currency, quotation numbering and defaults. */
export function PreferencesForm({ initial }: PreferencesFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<PrefsValues>({
    defaultValues: {
      currencySymbol: initial.currencySymbol,
      currencyCode: initial.currencyCode,
      quotationPrefix: initial.quotationPrefix,
      defaultGstPercent: initial.defaultGstPercent,
      defaultValidityDays: initial.defaultValidityDays,
      lastSequence: initial.lastSequence,
    },
  });

  React.useEffect(() => {
    reset({
      currencySymbol: initial.currencySymbol,
      currencyCode: initial.currencyCode,
      quotationPrefix: initial.quotationPrefix,
      defaultGstPercent: initial.defaultGstPercent,
      defaultValidityDays: initial.defaultValidityDays,
      lastSequence: initial.lastSequence,
    });
  }, [initial, reset]);

  async function onSubmit(values: PrefsValues) {
    await settingsService.update({
      currencySymbol: values.currencySymbol.trim() || "₹",
      currencyCode: values.currencyCode.trim().toUpperCase() || "INR",
      quotationPrefix: values.quotationPrefix.trim().toUpperCase() || "QTN",
      defaultGstPercent: Number(values.defaultGstPercent) || 0,
      defaultValidityDays: Number(values.defaultValidityDays) || 0,
      lastSequence: Math.max(0, Math.floor(Number(values.lastSequence) || 0)),
    });
    reset(values);
    toast.success("Preferences saved.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Currency</CardTitle>
          <CardDescription>
            Used for all amounts across the app and PDFs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Currency Symbol" htmlFor="currencySymbol">
            <Input id="currencySymbol" {...register("currencySymbol")} />
          </FormField>
          <FormField label="Currency Code" htmlFor="currencyCode">
            <Input id="currencyCode" placeholder="INR" {...register("currencyCode")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quotation Numbering</CardTitle>
          <CardDescription>
            Next number is generated as PREFIX-YEAR-####.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Prefix"
            htmlFor="quotationPrefix"
            hint="e.g. QTN"
          >
            <Input id="quotationPrefix" {...register("quotationPrefix")} />
          </FormField>
          <FormField
            label="Last Used Sequence"
            htmlFor="lastSequence"
            hint="Next quotation = this + 1"
          >
            <Input
              id="lastSequence"
              type="number"
              min={0}
              {...register("lastSequence", { valueAsNumber: true })}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quotation Defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Default GST %" htmlFor="defaultGstPercent">
            <Input
              id="defaultGstPercent"
              type="number"
              min={0}
              max={100}
              step="0.01"
              {...register("defaultGstPercent", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Default Validity (days)"
            htmlFor="defaultValidityDays"
            hint="Auto-fills 'Valid Till'"
          >
            <Input
              id="defaultValidityDays"
              type="number"
              min={0}
              {...register("defaultValidityDays", { valueAsNumber: true })}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving…" : "Save Preferences"}
        </Button>
      </div>
    </form>
  );
}
