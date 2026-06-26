"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuotations, useSettings } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils";
import { ROUTES } from "@/lib/constants";

/** Compact list of the most recent quotations on the dashboard. */
export function RecentQuotations() {
  const { quotations, isLoading } = useQuotations({
    sortField: "createdAt",
    sortDirection: "desc",
  });
  const { settings } = useSettings();
  const symbol = settings?.currencySymbol ?? "₹";
  const recent = quotations.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Recent Quotations</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href={ROUTES.quotations}>View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No quotations yet"
            description="Create your first quotation to see it here."
            action={
              <Button asChild>
                <Link href={ROUTES.newQuotation}>New Quotation</Link>
              </Button>
            }
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <ul className="divide-y">
            {recent.map((q) => (
              <li key={q.id}>
                <Link
                  href={`${ROUTES.quotations}/${q.id}`}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-accent/40 -mx-2 px-2 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {q.customer.name || "Unnamed customer"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {q.quotationNumber} · {formatDate(q.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(q.totals.grandTotal, symbol)}
                    </span>
                    <Badge
                      variant={q.status === "draft" ? "warning" : "success"}
                    >
                      {q.status === "draft" ? "Draft" : "Final"}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
