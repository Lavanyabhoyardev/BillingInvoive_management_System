"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { QuotationListView } from "@/components/tables/quotation-list-view";
import { ROUTES } from "@/lib/constants";

export default function QuotationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        description="All your finalized quotations."
        actions={
          <Button asChild>
            <Link href={ROUTES.newQuotation}>
              <FilePlus2 className="h-4 w-4" />
              New Quotation
            </Link>
          </Button>
        }
      />
      <QuotationListView
        status="final"
        emptyTitle="No quotations yet"
        emptyDescription="Finalized quotations will appear here. Create your first one to get started."
      />
    </div>
  );
}
