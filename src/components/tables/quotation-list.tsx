"use client";

import * as React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QuotationRowActions } from "./quotation-row-actions";
import { formatCurrency, formatDate } from "@/utils";
import { ROUTES } from "@/lib/constants";
import type { Quotation } from "@/types";

interface QuotationListProps {
  quotations: Quotation[];
  isLoading: boolean;
  currencySymbol: string;
}

/** Responsive list of quotations: table on desktop, cards on mobile. */
export function QuotationList({
  quotations,
  isLoading,
  currencySymbol,
}: QuotationListProps) {
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
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Quotation</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((q) => (
              <TableRow key={q.id} className="group">
                <TableCell>
                  <Link
                    href={`${ROUTES.quotations}/${q.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {q.quotationNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {q.customer.name || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {q.customer.phone || "No phone"}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(q.date)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(q.totals.grandTotal, currencySymbol)}
                </TableCell>
                <TableCell>
                  <Badge variant={q.status === "draft" ? "warning" : "success"}>
                    {q.status === "draft" ? "Draft" : "Final"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <QuotationRowActions quotation={q} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {quotations.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`${ROUTES.quotations}/${q.id}`}
                  className="font-semibold hover:text-primary"
                >
                  {q.customer.name || "—"}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {q.quotationNumber} · {formatDate(q.date)}
                </p>
              </div>
              <QuotationRowActions quotation={q} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge variant={q.status === "draft" ? "warning" : "success"}>
                {q.status === "draft" ? "Draft" : "Final"}
              </Badge>
              <span className="font-bold tabular-nums">
                {formatCurrency(q.totals.grandTotal, currencySymbol)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
