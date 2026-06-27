"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Phone } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCustomers, useSettings } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils";
import { ROUTES } from "@/lib/constants";

export default function CustomersPage() {
  const [search, setSearch] = React.useState("");
  const { customers, isLoading } = useCustomers();
  const { settings } = useSettings();
  const symbol = settings?.currencySymbol ?? "₹";

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term)
    );
  }, [customers, search]);

  const showEmpty = !isLoading && filtered.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Every customer with their quotations, invoices and dues."
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name or phone…"
        className="sm:max-w-md"
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : showEmpty ? (
        <EmptyState
          icon={Users}
          title={search ? "No customers found" : "No customers yet"}
          description={
            search
              ? "Try a different search term."
              : "Customers appear here once you create quotations or invoices."
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Quotations</TableHead>
                  <TableHead className="text-center">Invoices / Bills</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead>Last Service</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.key}>
                    <TableCell>
                      <Link
                        href={`${ROUTES.customers}/${encodeURIComponent(c.key)}`}
                        className="font-medium hover:text-primary"
                      >
                        {c.name}
                      </Link>
                      {c.phone ? (
                        <div className="text-xs text-muted-foreground">
                          {c.phone}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {c.totalQuotations}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {c.totalInvoices}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.pendingAmount > 0 ? (
                        <span className="font-semibold tabular-nums text-destructive">
                          {formatCurrency(c.pendingAmount, symbol)}
                        </span>
                      ) : (
                        <Badge variant="success">Clear</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.lastServiceDate ? formatDate(c.lastServiceDate) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((c) => (
              <Link
                key={c.key}
                href={`${ROUTES.customers}/${encodeURIComponent(c.key)}`}
                className="block rounded-xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{c.name}</p>
                  {c.pendingAmount > 0 ? (
                    <span className="text-sm font-semibold text-destructive">
                      {formatCurrency(c.pendingAmount, symbol)}
                    </span>
                  ) : (
                    <Badge variant="success">Clear</Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  {c.phone ? (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {c.phone}
                    </span>
                  ) : null}
                  <span>{c.totalQuotations} quotations</span>
                  <span>{c.totalInvoices} invoices / bills</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
