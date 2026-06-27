"use client";

import { useRouter } from "next/navigation";
import { Copy, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { invoiceService } from "@/services";
import { ROUTES } from "@/lib/constants";
import type { Invoice } from "@/types";

/** Per-row action menu for an invoice. */
export function InvoiceRowActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this invoice / bill?",
      description: `${invoice.invoiceNumber} will be permanently removed.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    await invoiceService.remove(invoice.id);
    toast.success("Invoice / Bill deleted.");
  }

  async function handleDuplicate() {
    const copy = await invoiceService.duplicate(invoice.id);
    toast.success("Invoice / Bill duplicated.");
    router.push(`${ROUTES.invoices}/${copy.id}/edit`);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() => router.push(`${ROUTES.invoices}/${invoice.id}`)}
          >
            <Eye className="h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`${ROUTES.invoices}/${invoice.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
            Duplicate
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
