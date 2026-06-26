"use client";

import * as React from "react";
import Link from "next/link";
import { Calculator, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { EstimateList } from "@/components/estimates/estimate-list";
import { useEstimates, useSettings } from "@/hooks";
import { ROUTES } from "@/lib/constants";

export default function EstimatesPage() {
  const [search, setSearch] = React.useState("");
  const { estimates, isLoading } = useEstimates({
    search,
    sortField: "createdAt",
    sortDirection: "desc",
  });
  const { settings } = useSettings();
  const symbol = settings?.currencySymbol ?? "₹";
  const showEmpty = !isLoading && estimates.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estimates"
        description="Quick cost estimates for anything — no full quotation needed."
        actions={
          <Button asChild>
            <Link href={ROUTES.newEstimate}>
              <Plus className="h-4 w-4" />
              New Estimate
            </Link>
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by title, reference or number…"
        className="sm:max-w-md"
      />

      {showEmpty ? (
        <EmptyState
          icon={Calculator}
          title={search ? "No estimates found" : "No estimates yet"}
          description={
            search
              ? "Try a different search term."
              : "Create a quick cost estimate to share with a customer."
          }
          action={
            !search ? (
              <Button asChild>
                <Link href={ROUTES.newEstimate}>
                  <Plus className="h-4 w-4" />
                  New Estimate
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <EstimateList
          estimates={estimates}
          isLoading={isLoading}
          currencySymbol={symbol}
        />
      )}
    </div>
  );
}
