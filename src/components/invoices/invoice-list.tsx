"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import { InvoiceRowActions } from "./invoice-row-actions";
import { formatCurrency, formatDate } from "@/utils";
import { ROUTES } from "@/lib/constants";
import type { Invoice } from "@/types";

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading: boolean;
  currencySymbol: string;
}

/** Responsive invoice table (desktop) / cards (mobile). */
export function InvoiceList({
  invoices,
  isLoading,
  currencySymbol,
}: InvoiceListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Invoice / Bill</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <Link
                    href={`${ROUTES.invoices}/${inv.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {inv.invoiceNumber}
                  </Link>
                  {inv.status === "draft" && (
                    <Badge variant="warning" className="ml-2">
                      Draft
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{inv.customer.name || "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {inv.customer.phone || "No phone"}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(inv.date)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(inv.totals.grandTotal, currencySymbol)}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={inv.paymentStatus} />
                </TableCell>
                <TableCell>
                  <InvoiceRowActions invoice={inv} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {invoices.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`${ROUTES.invoices}/${inv.id}`}
                  className="font-semibold hover:text-primary"
                >
                  {inv.customer.name || "—"}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {inv.invoiceNumber} · {formatDate(inv.date)}
                </p>
              </div>
              <InvoiceRowActions invoice={inv} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <PaymentStatusBadge status={inv.paymentStatus} />
              <span className="font-bold tabular-nums">
                {formatCurrency(inv.totals.grandTotal, currencySymbol)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
