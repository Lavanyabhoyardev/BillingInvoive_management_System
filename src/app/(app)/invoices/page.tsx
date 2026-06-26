"use client";

import * as React from "react";
import Link from "next/link";
import { Receipt, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DateRangeFilter,
  rangeForPreset,
  type RangePreset,
} from "@/components/invoices/date-range-filter";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { useInvoices, useSettings } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import type { InvoiceDateRange } from "@/services";

export default function InvoicesPage() {
  const [search, setSearch] = React.useState("");
  const [preset, setPreset] = React.useState<RangePreset>("all");
  const [range, setRange] = React.useState<InvoiceDateRange>(
    rangeForPreset("all")
  );

  const { settings } = useSettings();
  const { invoices, isLoading } = useInvoices({
    search,
    range,
    sortField: "createdAt",
    sortDirection: "desc",
  });

  const symbol = settings?.currencySymbol ?? "₹";
  const showEmpty = !isLoading && invoices.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Generate and track bills. Filter by date and search instantly."
        actions={
          <Button asChild>
            <Link href={ROUTES.newInvoice}>
              <Plus className="h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <DateRangeFilter
          preset={preset}
          range={range}
          onChange={(p, r) => {
            setPreset(p);
            setRange(r);
          }}
        />
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by customer, phone, invoice number or date…"
          className="sm:max-w-md"
        />
      </div>

      {showEmpty ? (
        <EmptyState
          icon={Receipt}
          title={search || preset !== "all" ? "No invoices found" : "No invoices yet"}
          description={
            search || preset !== "all"
              ? "Try a different search or date range."
              : "Create your first invoice, or convert a quotation into one."
          }
          action={
            <Button asChild>
              <Link href={ROUTES.newInvoice}>
                <Plus className="h-4 w-4" />
                New Invoice
              </Link>
            </Button>
          }
        />
      ) : (
        <InvoiceList
          invoices={invoices}
          isLoading={isLoading}
          currencySymbol={symbol}
        />
      )}
    </div>
  );
}
