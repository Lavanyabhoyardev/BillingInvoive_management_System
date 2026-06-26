"use client";

import { CreditCard } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "./form-field";
import { NumberInput } from "./number-input";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/types";
import { formatCurrency } from "@/utils";
import type { InvoiceFormApi } from "@/hooks";
import type { PaymentMethod, PaymentStatus } from "@/types";

/** Payment status, method and partial-payment tracking. */
export function PaymentSection({
  form,
  currencySymbol,
}: {
  form: InvoiceFormApi;
  currencySymbol: string;
}) {
  const { state, patch, totals } = form;
  const isPartial = state.paymentStatus === "partial";
  const remaining = Math.max(0, totals.grandTotal - (state.paidAmount || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4 text-primary" />
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Payment Status">
            <Select
              value={state.paymentStatus}
              onValueChange={(v) =>
                patch({ paymentStatus: v as PaymentStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Payment Method">
            <Select
              value={state.paymentMethod ?? ""}
              onValueChange={(v) =>
                patch({ paymentMethod: v as PaymentMethod })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {isPartial && (
          <div className="grid gap-4 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2">
            <FormField label="Paid Amount">
              <NumberInput
                value={state.paidAmount}
                onValueChange={(v) => patch({ paidAmount: v })}
                prefix={currencySymbol}
              />
            </FormField>
            <FormField label="Remaining Amount">
              <div className="flex h-9 items-center justify-end rounded-md bg-background px-3 font-semibold tabular-nums text-destructive">
                {formatCurrency(remaining, currencySymbol)}
              </div>
            </FormField>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
