"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/db";
import { templateService } from "@/services";
import type { QuotationTemplate } from "@/types";

/** Reactive list of templates, optionally filtered by search. */
export function useTemplates(search?: string): {
  templates: QuotationTemplate[];
  isLoading: boolean;
} {
  const templates = useLiveQuery(
    () => templateService.getAll(search),
    [search],
    undefined
  );
  return { templates: templates ?? [], isLoading: templates === undefined };
}

/** Reactive single template by id. */
export function useTemplate(id?: string): {
  template: QuotationTemplate | undefined;
  isLoading: boolean;
} {
  const template = useLiveQuery(
    () => (id ? getDb().templates.get(id) : undefined),
    [id],
    undefined
  );
  return { template, isLoading: Boolean(id) && template === undefined };
}
