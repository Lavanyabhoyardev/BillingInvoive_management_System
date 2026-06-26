"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileCheck2,
  FileWarning,
  Pencil,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { QuotationDocument } from "@/components/pdf/quotation-document";
import { DocumentPreview } from "@/components/pdf/document-preview";
import { ExportToolbar } from "@/components/pdf/export-toolbar";
import { useCompany, useQuotation, useSettings } from "@/hooks";
import { invoiceService, quotationService } from "@/services";
import { ROUTES } from "@/lib/constants";

export default function QuotationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const docRef = React.useRef<HTMLDivElement>(null);

  const { quotation, isLoading } = useQuotation(params.id);
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

  if (!quotation) {
    return (
      <EmptyState
        icon={FileWarning}
        title="Quotation not found"
        description="It may have been deleted."
        action={
          <Button onClick={() => router.push(ROUTES.quotations)}>
            Back to Quotations
          </Button>
        }
      />
    );
  }

  const symbol = settings?.currencySymbol ?? "₹";
  const isDraft = quotation.status === "draft";

  async function handleConvert() {
    await quotationService.convertToFinal(quotation!.id);
    toast.success("Converted to a final quotation.");
  }

  async function handleConvertToInvoice() {
    const invoice = await invoiceService.createFromQuotation(quotation!);
    toast.success("Invoice created from quotation.");
    router.push(`${ROUTES.invoices}/${invoice.id}`);
  }

  return (
    <div className="space-y-6">
      {/* Header / actions (hidden in print) */}
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
                {quotation.quotationNumber}
              </h1>
              <Badge variant={isDraft ? "warning" : "success"}>
                {isDraft ? "Draft" : "Final"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {quotation.customer.name || "—"}
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`${ROUTES.quotations}/${quotation.id}/edit`)
              }
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            {isDraft && (
              <Button variant="secondary" onClick={handleConvert}>
                <FileCheck2 className="h-4 w-4" />
                Convert to Quotation
              </Button>
            )}
            <Button onClick={handleConvertToInvoice}>
              <Receipt className="h-4 w-4" />
              Convert to Invoice
            </Button>
          </div>
        </div>

        <ExportToolbar
          targetRef={docRef}
          filename={`${quotation.quotationNumber}-${quotation.customer.name}`}
        />
      </div>

      {/* Live preview (scaled). The document itself keeps full size. */}
      <DocumentPreview>
        <QuotationDocument
          ref={docRef}
          quotation={quotation}
          company={company}
          currencySymbol={symbol}
        />
      </DocumentPreview>
    </div>
  );
}
