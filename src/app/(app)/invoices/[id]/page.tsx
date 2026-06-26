"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, FileWarning, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PaymentStatusBadge } from "@/components/invoices/payment-status-badge";
import { InvoiceDocument } from "@/components/pdf/invoice-document";
import { DocumentPreview } from "@/components/pdf/document-preview";
import { ExportToolbar } from "@/components/pdf/export-toolbar";
import { ShareButtons } from "@/components/pdf/share-buttons";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { useCompany, useInvoice, useSettings } from "@/hooks";
import { invoiceService } from "@/services";
import { ROUTES } from "@/lib/constants";

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const docRef = React.useRef<HTMLDivElement>(null);
  const { confirm, dialog } = useConfirm();

  const { invoice, isLoading } = useInvoice(params.id);
  const { company } = useCompany();
  const { settings } = useSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <EmptyState
        icon={FileWarning}
        title="Invoice not found"
        description="It may have been deleted."
        action={
          <Button onClick={() => router.push(ROUTES.invoices)}>
            Back to Invoices
          </Button>
        }
      />
    );
  }

  const symbol = settings?.currencySymbol ?? "₹";

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this invoice?",
      description: `${invoice!.invoiceNumber} will be permanently removed.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    await invoiceService.remove(invoice!.id);
    toast.success("Invoice deleted.");
    router.push(ROUTES.invoices);
  }

  async function handleDuplicate() {
    const copy = await invoiceService.duplicate(invoice!.id);
    toast.success("Invoice duplicated.");
    router.push(`${ROUTES.invoices}/${copy.id}/edit`);
  }

  return (
    <div className="space-y-6">
      <div className="no-print space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <PaymentStatusBadge status={invoice.paymentStatus} />
            </div>
            <p className="text-sm text-muted-foreground">
              {invoice.customer.name || "—"}
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`${ROUTES.invoices}/${invoice.id}/edit`)
              }
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportToolbar
            targetRef={docRef}
            filename={`${invoice.invoiceNumber}-${invoice.customer.name}`}
          />
          <ShareButtons
            docLabel="Invoice"
            number={invoice.invoiceNumber}
            customerName={invoice.customer.name}
            customerPhone={invoice.customer.phone}
            companyName={company?.companyName}
            grandTotal={invoice.totals.grandTotal}
            currencySymbol={symbol}
          />
        </div>
      </div>

      <DocumentPreview>
        <InvoiceDocument
          ref={docRef}
          invoice={invoice}
          company={company}
          currencySymbol={symbol}
        />
      </DocumentPreview>

      {dialog}
    </div>
  );
}
