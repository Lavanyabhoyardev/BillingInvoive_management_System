"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { QuotationBuilder } from "@/components/forms/quotation-builder";
import { useSettings, useTemplate } from "@/hooks";
import { settingsService } from "@/services";

function NewQuotationContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") ?? undefined;

  const { settings } = useSettings();
  const { template, isLoading: templateLoading } = useTemplate(templateId);
  const [nextNumber, setNextNumber] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    settingsService.peekNextNumber().then((n) => {
      if (active) setNextNumber(n);
    });
    return () => {
      active = false;
    };
  }, []);

  const ready =
    settings && nextNumber !== null && (!templateId || !templateLoading);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Quotation"
        description="Build a quotation in seconds. Load a template to go even faster."
      />
      {ready ? (
        <QuotationBuilder
          settings={settings}
          initialNumber={nextNumber}
          autoTemplate={template}
        />
      ) : (
        <BuilderSkeleton />
      )}
    </div>
  );
}

export default function NewQuotationPage() {
  return (
    <React.Suspense fallback={<BuilderSkeleton />}>
      <NewQuotationContent />
    </React.Suspense>
  );
}

function BuilderSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
