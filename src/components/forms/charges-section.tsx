"use client";

import { Wallet } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "./form-field";
import { NumberInput } from "./number-input";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { AdditionalCharges } from "@/types";

const CHARGE_FIELDS: { key: keyof AdditionalCharges; label: string }[] = [
  { key: "serviceCharge", label: "Service Charge" },
  { key: "installationCharge", label: "Installation Charge" },
  { key: "visitingCharge", label: "Visiting Charge" },
  { key: "transportationCharge", label: "Transportation Charge" },
  { key: "otherCharges", label: "Other Charges" },
];

interface ChargesSectionProps {
  charges: AdditionalCharges;
  /** When false, charges are excluded from totals and hidden on the document. */
  includeCharges: boolean;
  discount: number;
  gstPercent: number;
  currencySymbol: string;
  onCharge: (field: keyof AdditionalCharges, value: number) => void;
  onIncludeChange: (value: boolean) => void;
  onDiscount: (value: number) => void;
  onGst: (value: number) => void;
}

/** Additional charges, discount and GST inputs — shared by quotation & invoice. */
export function ChargesSection({
  charges,
  includeCharges,
  discount,
  gstPercent,
  currencySymbol,
  onCharge,
  onIncludeChange,
  onDiscount,
  onGst,
}: ChargesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Additional Charges
          </span>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-normal text-muted-foreground">
            {includeCharges ? "Shown on document" : "Hidden from document"}
            <Switch
              checked={includeCharges}
              onCheckedChange={onIncludeChange}
              aria-label="Include additional charges"
            />
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
            !includeCharges && "pointer-events-none opacity-50"
          )}
        >
          {CHARGE_FIELDS.map((field) => (
            <FormField key={field.key} label={field.label}>
              <NumberInput
                value={charges[field.key]}
                onValueChange={(v) => onCharge(field.key, v)}
                prefix={currencySymbol}
                disabled={!includeCharges}
              />
            </FormField>
          ))}
        </div>

        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <FormField label="Discount" hint="Flat amount off the subtotal + charges">
            <NumberInput
              value={discount}
              onValueChange={onDiscount}
              prefix={currencySymbol}
            />
          </FormField>
          <FormField label="GST %" hint="Applied after discount">
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={Number.isFinite(gstPercent) ? gstPercent : 0}
                onChange={(e) => onGst(Math.max(0, Number(e.target.value) || 0))}
                className="pr-8 text-right tabular-nums"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </FormField>
        </div>
      </CardContent>
    </Card>
  );
}
