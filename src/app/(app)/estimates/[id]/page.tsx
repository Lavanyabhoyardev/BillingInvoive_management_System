"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, FileWarning, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { EstimateDocument } from "@/components/pdf/estimate-document";
import { DocumentPreview } from "@/components/pdf/document-preview";
import { ExportToolbar } from "@/components/pdf/export-toolbar";
import { ShareButtons } from "@/components/pdf/share-buttons";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { useCompany, useEstimate, useSettings } from "@/hooks";
import { estimateService } from "@/services";
import { ROUTES } from "@/lib/constants";

export default function EstimateDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const docRef = React.useRef<HTMLDivElement>(null);
  const { confirm, dialog } = useConfirm();

  const { estimate, isLoading } = useEstimate(params.id);
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

  if (!estimate) {
    return (
      <EmptyState
        icon={FileWarning}
        title="Estimate not found"
        description="It may have been deleted."
        action={
          <Button onClick={() => router.push(ROUTES.estimates)}>
            Back to Estimates
          </Button>
        }
      />
    );
  }

  const symbol = settings?.currencySymbol ?? "₹";

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this estimate?",
      description: `${estimate!.estimateNumber} will be permanently removed.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    await estimateService.remove(estimate!.id);
    toast.success("Estimate deleted.");
    router.push(ROUTES.estimates);
  }

  async function handleDuplicate() {
    const copy = await estimateService.duplicate(estimate!.id);
    toast.success("Estimate duplicated.");
    router.push(`${ROUTES.estimates}/${copy.id}/edit`);
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
            <h1 className="text-xl font-bold tracking-tight">
              {estimate.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {estimate.estimateNumber}
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`${ROUTES.estimates}/${estimate.id}/edit`)
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
            filename={`${estimate.estimateNumber}-${estimate.title}`}
          />
          <ShareButtons
            docLabel="Estimate"
            number={estimate.estimateNumber}
            customerName={estimate.forName}
            companyName={company?.companyName}
            grandTotal={estimate.totals.grandTotal}
            currencySymbol={symbol}
          />
        </div>
      </div>

      <DocumentPreview>
        <EstimateDocument
          ref={docRef}
          estimate={estimate}
          company={company}
          currencySymbol={symbol}
        />
      </DocumentPreview>

      {dialog}
    </div>
  );
}
