"use client";

import { User } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./form-field";
import type { QuotationFormApi } from "@/hooks";

/** Customer & quotation meta (number, date, valid-till, notes). */
export function CustomerSection({ form }: { form: QuotationFormApi }) {
  const { state, setCustomer, patch } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-primary" />
          Customer & Quotation Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Customer Name" htmlFor="cust-name" required>
            <Input
              id="cust-name"
              placeholder="e.g. Amit Verma"
              value={state.customer.name}
              onChange={(e) => setCustomer("name", e.target.value)}
            />
          </FormField>
          <FormField label="Phone Number" htmlFor="cust-phone">
            <Input
              id="cust-phone"
              placeholder="Customer contact"
              value={state.customer.phone}
              onChange={(e) => setCustomer("phone", e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Address" htmlFor="cust-address">
          <Textarea
            id="cust-address"
            rows={2}
            placeholder="Customer address (optional)"
            value={state.customer.address ?? ""}
            onChange={(e) => setCustomer("address", e.target.value)}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Quotation No." htmlFor="q-number">
            <Input
              id="q-number"
              value={state.quotationNumber}
              onChange={(e) => patch({ quotationNumber: e.target.value })}
              className="font-medium"
            />
          </FormField>
          <FormField label="Date" htmlFor="q-date">
            <Input
              id="q-date"
              type="date"
              value={state.date}
              onChange={(e) => patch({ date: e.target.value })}
            />
          </FormField>
          <FormField label="Valid Till" htmlFor="q-valid">
            <Input
              id="q-valid"
              type="date"
              value={state.validTill}
              onChange={(e) => patch({ validTill: e.target.value })}
            />
          </FormField>
        </div>

        <FormField label="Notes" htmlFor="q-notes" hint="Visible on the quotation">
          <Textarea
            id="q-notes"
            rows={2}
            placeholder="Any note for the customer (optional)"
            value={state.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </FormField>
      </CardContent>
    </Card>
  );
}
