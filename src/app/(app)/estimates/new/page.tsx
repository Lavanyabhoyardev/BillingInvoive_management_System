"use client";

import * as React from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EstimateBuilder } from "@/components/forms/estimate-builder";
import { useSettings } from "@/hooks";
import { settingsService } from "@/services";

export default function NewEstimatePage() {
  const { settings } = useSettings();
  const [nextNumber, setNextNumber] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    settingsService.peekNextEstimateNumber().then((n) => {
      if (active) setNextNumber(n);
    });
    return () => {
      active = false;
    };
  }, []);

  const ready = settings && nextNumber !== null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Estimate"
        description="Add items and instantly see the estimated cost."
      />
      {ready ? (
        <EstimateBuilder settings={settings} initialNumber={nextNumber} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
