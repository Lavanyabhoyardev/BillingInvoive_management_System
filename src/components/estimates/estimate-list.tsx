"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Receipt,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { estimateService, invoiceService } from "@/services";
import { formatCurrency, formatDate } from "@/utils";
import { ROUTES } from "@/lib/constants";
import type { Estimate } from "@/types";

interface EstimateListProps {
  estimates: Estimate[];
  isLoading: boolean;
  currencySymbol: string;
}

function RowActions({ estimate }: { estimate: Estimate }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this estimate?",
      description: `${estimate.estimateNumber} will be permanently removed.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    await estimateService.remove(estimate.id);
    toast.success("Estimate deleted.");
  }

  async function handleDuplicate() {
    const copy = await estimateService.duplicate(estimate.id);
    toast.success("Estimate duplicated.");
    router.push(`${ROUTES.estimates}/${copy.id}/edit`);
  }

  async function handleConvertToInvoice() {
    const invoice = await invoiceService.createFromEstimate(estimate);
    toast.success("Bill created — add the customer details and save.");
    router.push(`${ROUTES.invoices}/${invoice.id}/edit`);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => router.push(`${ROUTES.estimates}/${estimate.id}`)}
          >
            <Eye className="h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`${ROUTES.estimates}/${estimate.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleConvertToInvoice}>
            <Receipt className="h-4 w-4" />
            Convert to Bill
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog}
    </>
  );
}

/** Responsive estimate list. */
export function EstimateList({
  estimates,
  isLoading,
  currencySymbol,
}: EstimateListProps) {
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
              <TableHead>Estimate</TableHead>
              <TableHead>For</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {estimates.map((est) => (
              <TableRow key={est.id}>
                <TableCell>
                  <Link
                    href={`${ROUTES.estimates}/${est.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {est.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {est.estimateNumber}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {est.forName || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(est.date)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(est.totals.grandTotal, currencySymbol)}
                </TableCell>
                <TableCell>
                  <RowActions estimate={est} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {estimates.map((est, i) => (
          <motion.div
            key={est.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`${ROUTES.estimates}/${est.id}`}
                  className="font-semibold hover:text-primary"
                >
                  {est.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {est.estimateNumber} · {formatDate(est.date)}
                </p>
              </div>
              <RowActions estimate={est} />
            </div>
            <div className="mt-3 text-right font-bold tabular-nums">
              {formatCurrency(est.totals.grandTotal, currencySymbol)}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
