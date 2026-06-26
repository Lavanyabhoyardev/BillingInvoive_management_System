"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Copy,
  FilePlus2,
  MoreVertical,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { templateService } from "@/services";
import { calculateTotals, formatCurrency } from "@/utils";
import { ROUTES } from "@/lib/constants";
import type { QuotationTemplate } from "@/types";

interface TemplateCardProps {
  template: QuotationTemplate;
  currencySymbol: string;
  onEdit: (template: QuotationTemplate) => void;
  index?: number;
}

/** A template tile with quick "Use" action and management menu. */
export function TemplateCard({
  template,
  currencySymbol,
  onEdit,
  index = 0,
}: TemplateCardProps) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();

  const totals = React.useMemo(
    () =>
      calculateTotals({
        items: template.items,
        charges: template.charges,
        discount: 0,
        gstPercent: template.gstPercent,
      }),
    [template]
  );

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this template?",
      description: `"${template.name}" will be permanently removed.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    await templateService.remove(template.id);
    toast.success("Template deleted.");
  }

  async function handleDuplicate() {
    await templateService.duplicate(template.id);
    toast.success("Template duplicated.");
  }

  function handleUse() {
    // Pass the template id so the new-quotation page can auto-load it.
    router.push(`${ROUTES.newQuotation}?template=${template.id}`);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.04 }}
      >
        <Card className="group flex h-full flex-col transition-shadow hover:shadow-md">
          <CardContent className="flex flex-1 flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold leading-tight">
                    {template.name}
                  </h3>
                  {template.category && (
                    <Badge variant="secondary" className="mt-1">
                      {template.category}
                    </Badge>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Actions">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {template.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            )}

            <div className="mt-auto flex items-center justify-between border-t pt-4 text-sm">
              <span className="text-muted-foreground">
                {template.items.length} item
                {template.items.length === 1 ? "" : "s"}
              </span>
              <span className="font-semibold tabular-nums">
                ≈ {formatCurrency(totals.grandTotal, currencySymbol)}
              </span>
            </div>

            <Button onClick={handleUse} className="w-full">
              <FilePlus2 className="h-4 w-4" />
              Use Template
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      {dialog}
    </>
  );
}
