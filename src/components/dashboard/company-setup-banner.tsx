"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/hooks";
import { companyService } from "@/services";
import { ROUTES } from "@/lib/constants";

/** Prompts the user to complete their company profile before quoting. */
export function CompanySetupBanner() {
  const { company, isLoading } = useCompany();

  if (isLoading || companyService.isComplete(company)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="flex flex-col gap-4 border-warning/40 bg-warning/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-warning/15 p-2 text-warning">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Complete your company profile</p>
            <p className="text-sm text-muted-foreground">
              Add your business name, contact and logo so they appear on every
              quotation and PDF.
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0">
          <Link href={ROUTES.settings}>
            Set up now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Card>
    </motion.div>
  );
}
