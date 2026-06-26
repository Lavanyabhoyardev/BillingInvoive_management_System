"use client";

import { useParams, useRouter } from "next/navigation";
import { FileWarning } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { EstimateBuilder } from "@/components/forms/estimate-builder";
import { useEstimate, useSettings } from "@/hooks";
import { ROUTES } from "@/lib/constants";

export default function EditEstimatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { estimate, isLoading } = useEstimate(params.id);
  const { settings } = useSettings();

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
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

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${estimate.estimateNumber}`} />
      <EstimateBuilder settings={settings} existing={estimate} />
    </div>
  );
}
