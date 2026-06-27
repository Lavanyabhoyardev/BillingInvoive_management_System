"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Eye,
  FileCheck2,
  MoreHorizontal,
  Pencil,
  Receipt,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { invoiceService, quotationService } from "@/services";
import { ROUTES } from "@/lib/constants";
import type { Quotation } from "@/types";

/** Per-row action menu for a quotation/draft. */
export function QuotationRowActions({ quotation }: { quotation: Quotation }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this quotation?",
      description: `${quotation.quotationNumber} for ${
        quotation.customer.name || "customer"
      } will be permanently removed.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    await quotationService.remove(quotation.id);
    toast.success("Quotation deleted.");
  }

  async function handleDuplicate() {
    const copy = await quotationService.duplicate(quotation.id);
    toast.success("Duplicated as a new draft.");
    router.push(`${ROUTES.quotations}/${copy.id}/edit`);
  }

  async function handleConvert() {
    await quotationService.convertToFinal(quotation.id);
    toast.success("Converted to a final quotation.");
    router.push(`${ROUTES.quotations}/${quotation.id}`);
  }

  async function handleConvertToInvoice() {
    const invoice = await invoiceService.createFromQuotation(quotation);
    toast.success("Invoice / Bill created from quotation.");
    router.push(`${ROUTES.invoices}/${invoice.id}`);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => router.push(`${ROUTES.quotations}/${quotation.id}`)}
          >
            <Eye className="h-4 w-4" />
            Open / Preview
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`${ROUTES.quotations}/${quotation.id}/edit`)
            }
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          {quotation.status === "draft" && (
            <DropdownMenuItem onClick={handleConvert}>
              <FileCheck2 className="h-4 w-4" />
              Convert to Quotation
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleConvertToInvoice}>
            <Receipt className="h-4 w-4" />
            Convert to Invoice / Bill
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
