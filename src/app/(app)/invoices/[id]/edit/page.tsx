"use client";

import { useParams, useRouter } from "next/navigation";
import { FileWarning } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { InvoiceBuilder } from "@/components/forms/invoice-builder";
import { useInvoice, useSettings } from "@/hooks";
import { ROUTES } from "@/lib/constants";

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { invoice, isLoading } = useInvoice(params.id);
  const { settings } = useSettings();

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <EmptyState
        icon={FileWarning}
        title="Invoice / Bill not found"
        description="It may have been deleted."
        action={
          <Button onClick={() => router.push(ROUTES.invoices)}>
            Back to Invoices / Bills
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${invoice.invoiceNumber}`} />
      <InvoiceBuilder settings={settings} existing={invoice} />
    </div>
  );
}
