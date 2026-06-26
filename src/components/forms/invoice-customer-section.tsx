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
import type { InvoiceFormApi } from "@/hooks";

/** Customer + invoice meta (number, date, due date, notes). */
export function InvoiceCustomerSection({ form }: { form: InvoiceFormApi }) {
  const { state, setCustomer, patch } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-primary" />
          Customer & Invoice Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Customer Name" htmlFor="inv-name" required>
            <Input
              id="inv-name"
              placeholder="e.g. Amit Verma"
              value={state.customer.name}
              onChange={(e) => setCustomer("name", e.target.value)}
            />
          </FormField>
          <FormField label="Phone Number" htmlFor="inv-phone">
            <Input
              id="inv-phone"
              placeholder="Customer contact"
              value={state.customer.phone}
              onChange={(e) => setCustomer("phone", e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Address" htmlFor="inv-address">
            <Textarea
              id="inv-address"
              rows={2}
              placeholder="Customer address (optional)"
              value={state.customer.address ?? ""}
              onChange={(e) => setCustomer("address", e.target.value)}
            />
          </FormField>
          <FormField label="GST Number" htmlFor="inv-gst" hint="Customer GSTIN (optional)">
            <Input
              id="inv-gst"
              placeholder="Optional"
              value={state.customer.gstNumber ?? ""}
              onChange={(e) => setCustomer("gstNumber", e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Invoice No." htmlFor="inv-number">
            <Input
              id="inv-number"
              value={state.invoiceNumber}
              onChange={(e) => patch({ invoiceNumber: e.target.value })}
              className="font-medium"
            />
          </FormField>
          <FormField label="Invoice Date" htmlFor="inv-date">
            <Input
              id="inv-date"
              type="date"
              value={state.date}
              onChange={(e) => patch({ date: e.target.value })}
            />
          </FormField>
          <FormField label="Due Date" htmlFor="inv-due">
            <Input
              id="inv-due"
              type="date"
              value={state.dueDate}
              onChange={(e) => patch({ dueDate: e.target.value })}
            />
          </FormField>
        </div>

        <FormField label="Notes" htmlFor="inv-notes" hint="Visible on the bill">
          <Textarea
            id="inv-notes"
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
