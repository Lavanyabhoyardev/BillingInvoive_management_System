"use client";

import * as React from "react";
import { LayoutTemplate, Search, Package } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useTemplates } from "@/hooks";
import type { QuotationTemplate } from "@/types";

interface TemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: QuotationTemplate) => void;
}

/** Dialog to choose a template to load into the quotation builder. */
export function TemplatePickerDialog({
  open,
  onOpenChange,
  onSelect,
}: TemplatePickerDialogProps) {
  const [search, setSearch] = React.useState("");
  const { templates } = useTemplates(search);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            Load a Template
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {templates.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No templates found"
              description="Try a different search, or create one from a quotation."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  onSelect(tpl);
                  onOpenChange(false);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{tpl.name}</p>
                    {tpl.category && (
                      <Badge variant="secondary">{tpl.category}</Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {tpl.items.length} item{tpl.items.length === 1 ? "" : "s"}
                    {tpl.description ? ` · ${tpl.description}` : ""}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
