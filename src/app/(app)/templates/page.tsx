"use client";

import * as React from "react";
import { LayoutTemplate, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateEditorDialog } from "@/components/templates/template-editor-dialog";
import { useSettings, useTemplates } from "@/hooks";
import type { QuotationTemplate } from "@/types";

export default function TemplatesPage() {
  const [search, setSearch] = React.useState("");
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<QuotationTemplate | null>(null);

  const { templates, isLoading } = useTemplates(search);
  const { settings } = useSettings();
  const symbol = settings?.currencySymbol ?? "₹";

  function openNew() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(tpl: QuotationTemplate) {
    setEditing(tpl);
    setEditorOpen(true);
  }

  const showEmpty = !isLoading && templates.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Reusable item sets. Load one into a quotation and just edit prices."
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search templates by name or category…"
        className="sm:max-w-md"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : showEmpty ? (
        <EmptyState
          icon={LayoutTemplate}
          title={search ? "No templates found" : "No templates yet"
          }
          description={
            search
              ? "Try a different search term."
              : "Create a template to speed up repeat quotations."
          }
          action={
            !search ? (
              <Button onClick={openNew}>
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl, i) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              currencySymbol={symbol}
              onEdit={openEdit}
              index={i}
            />
          ))}
        </div>
      )}

      <TemplateEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editing}
        currencySymbol={symbol}
      />
    </div>
  );
}
