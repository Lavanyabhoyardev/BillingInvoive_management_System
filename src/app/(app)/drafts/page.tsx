"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { QuotationListView } from "@/components/tables/quotation-list-view";
import { ROUTES } from "@/lib/constants";

export default function DraftsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Drafts"
        description="Resume and finalize your saved drafts."
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
        status="draft"
        emptyTitle="No drafts saved"
        emptyDescription="Save a quotation as a draft to continue it later. Drafts show up here."
      />
    </div>
  );
}
