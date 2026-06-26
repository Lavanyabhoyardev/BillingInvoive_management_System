"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Receipt,
  IndianRupee,
  Clock,
  UserX,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { PaymentStatusBadge } from "@/components/invoices/payment-status-badge";
import { useCustomer, useSettings } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils";
import { ROUTES } from "@/lib/constants";

export default function CustomerDetailPage() {
  const params = useParams<{ key: string }>();
  const router = useRouter();
  const key = decodeURIComponent(params.key);
  const { customer, isLoading } = useCustomer(key);
  const { settings } = useSettings();
  const symbol = settings?.currencySymbol ?? "₹";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <EmptyState
        icon={UserX}
        title="Customer not found"
        description="This customer has no records."
        action={
          <Button onClick={() => router.push(ROUTES.customers)}>
            Back to Customers
          </Button>
        }
      />
    );
  }

  const quotations = [...customer.quotations].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const invoices = [...customer.invoices].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={customer.name}
          description={customer.phone || "No phone on record"}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          index={0}
          label="Total Quotations"
          value={customer.totalQuotations}
          icon={FileText}
          accent="blue"
        />
        <StatCard
          index={1}
          label="Total Invoices"
          value={customer.totalInvoices}
          icon={Receipt}
          accent="green"
        />
        <StatCard
          index={2}
          label="Paid Amount"
          value={formatCurrency(customer.paidAmount, symbol)}
          icon={IndianRupee}
          accent="slate"
        />
        <StatCard
          index={3}
          label="Pending Amount"
          value={formatCurrency(customer.pendingAmount, symbol)}
          icon={Clock}
          accent="amber"
        />
      </div>

      {customer.lastServiceDate && (
        <p className="text-sm text-muted-foreground">
          Last service:{" "}
          <span className="font-medium text-foreground">
            {formatDate(customer.lastServiceDate)}
          </span>
        </p>
      )}

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No invoices yet.
            </p>
          ) : (
            <ul className="divide-y">
              {invoices.map((inv) => (
                <li key={inv.id}>
                  <Link
                    href={`${ROUTES.invoices}/${inv.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-accent/40"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(inv.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(inv.totals.grandTotal, symbol)}
                      </span>
                      <PaymentStatusBadge status={inv.paymentStatus} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Quotations / service history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quotations & Service History</CardTitle>
        </CardHeader>
        <CardContent>
          {quotations.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No quotations yet.
            </p>
          ) : (
            <ul className="divide-y">
              {quotations.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`${ROUTES.quotations}/${q.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-accent/40"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{q.quotationNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDate(q.date)} ·{" "}
                        {q.items
                          .map((i) => i.name)
                          .filter(Boolean)
                          .slice(0, 2)
                          .join(", ")}
                        {q.items.length > 2 ? "…" : ""}
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
    </div>
  );
}
