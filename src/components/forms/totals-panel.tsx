"use client";

import { Receipt } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils";
import type { QuotationTotals } from "@/types";
import { cn } from "@/lib/utils";

interface TotalsPanelProps {
  totals: QuotationTotals;
  gstPercent: number;
  currencySymbol: string;
  className?: string;
}

/** Live totals summary with amount in words. */
export function TotalsPanel({
  totals,
  gstPercent,
  currencySymbol,
  className,
}: TotalsPanelProps) {
  const rows: { label: string; value: number; muted?: boolean; sign?: string }[] =
    [
      { label: "Subtotal", value: totals.subtotal },
      { label: "Charges", value: totals.chargesTotal },
      { label: "Discount", value: totals.discount, sign: "-" },
      { label: `GST (${gstPercent}%)`, value: totals.gstAmount },
    ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-muted/40">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-4 w-4 text-primary" />
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-5">
        <dl className="space-y-2.5 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium tabular-nums">
                {row.sign}
                {formatCurrency(row.value, currencySymbol)}
              </dd>
            </div>
          ))}
        </dl>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">Grand Total</span>
          <span className="text-xl font-bold text-primary tabular-nums">
            {formatCurrency(totals.grandTotal, currencySymbol)}
          </span>
        </div>

        <div className="rounded-lg bg-accent/60 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Amount in words
          </p>
          <p className="mt-1 text-sm font-medium leading-snug">
            {totals.grandTotalInWords}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
