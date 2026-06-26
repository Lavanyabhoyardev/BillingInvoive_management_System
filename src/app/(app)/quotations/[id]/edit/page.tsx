"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { FileWarning } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { QuotationBuilder } from "@/components/forms/quotation-builder";
import { useQuotation, useSettings } from "@/hooks";
import { ROUTES } from "@/lib/constants";

export default function EditQuotationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { quotation, isLoading } = useQuotation(params.id);
  const { settings } = useSettings();

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${quotation.quotationNumber}`}
        description={
          quotation.status === "draft"
            ? "Editing a draft."
            : "Editing a finalized quotation."
        }
      />
      <QuotationBuilder settings={settings} existing={quotation} />
    </div>
  );
}
