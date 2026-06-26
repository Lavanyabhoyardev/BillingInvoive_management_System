"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, FilePlus2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { SortControl, type SortState } from "./sort-control";
import { QuotationList } from "./quotation-list";
import { useQuotations, useSettings } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import type { QuotationStatus } from "@/types";

interface QuotationListViewProps {
  status?: QuotationStatus;
  emptyTitle: string;
  emptyDescription: string;
}

/** Search + sort + list, shared by the Quotations and Drafts pages. */
export function QuotationListView({
  status,
  emptyTitle,
  emptyDescription,
}: QuotationListViewProps) {
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortState>({
    field: "createdAt",
    direction: "desc",
  });

  const { settings } = useSettings();
  const { quotations, isLoading } = useQuotations({
    status,
    search,
    sortField: sort.field,
    sortDirection: sort.direction,
  });

  const symbol = settings?.currencySymbol ?? "₹";
  const showEmpty = !isLoading && quotations.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by customer, phone, number or date…"
          className="sm:max-w-md"
        />
        <div className="sm:ml-auto">
          <SortControl value={sort} onChange={setSort} />
        </div>
      </div>

      {showEmpty ? (
        <EmptyState
          icon={FileText}
          title={search ? "No matches found" : emptyTitle}
          description={
            search
              ? "Try a different search term."
              : emptyDescription
          }
          action={
            !search ? (
              <Button asChild>
                <Link href={ROUTES.newQuotation}>
                  <FilePlus2 className="h-4 w-4" />
                  New Quotation
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <QuotationList
          quotations={quotations}
          isLoading={isLoading}
          currencySymbol={symbol}
        />
      )}
    </div>
  );
}
