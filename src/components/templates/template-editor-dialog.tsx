"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { NumberInput } from "@/components/forms/number-input";
import { ItemsTable } from "@/components/tables/items-table";
import { createEmptyItem } from "@/hooks";
import { templateService } from "@/services";
import { computeItemAmount, generateId } from "@/utils";
import {
  EMPTY_CHARGES,
  type AdditionalCharges,
  type QuotationItem,
  type QuotationTemplate,
} from "@/types";

interface TemplateEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, edits this template; otherwise creates a new one. */
  template?: QuotationTemplate | null;
  currencySymbol: string;
}

const CHARGE_FIELDS: { key: keyof AdditionalCharges; label: string }[] = [
  { key: "serviceCharge", label: "Service" },
  { key: "installationCharge", label: "Installation" },
  { key: "visitingCharge", label: "Visiting" },
  { key: "transportationCharge", label: "Transport" },
  { key: "otherCharges", label: "Other" },
];

/** Create/edit a reusable template, including its items and default charges. */
export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  currencySymbol,
}: TemplateEditorDialogProps) {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [items, setItems] = React.useState<QuotationItem[]>([]);
  const [charges, setCharges] = React.useState<AdditionalCharges>({
    ...EMPTY_CHARGES,
  });
  const [gstPercent, setGstPercent] = React.useState(18);
  const [saving, setSaving] = React.useState(false);

  // Initialize when opened.
  React.useEffect(() => {
    if (!open) return;
    setName(template?.name ?? "");
    setCategory(template?.category ?? "");
    setDescription(template?.description ?? "");
    setItems(
      template?.items.length
        ? template.items.map((i) => ({ ...i }))
        : [createEmptyItem()]
    );
    setCharges({ ...EMPTY_CHARGES, ...(template?.charges ?? {}) });
    setGstPercent(template?.gstPercent ?? 18);
  }, [open, template]);

  // Item operations (mirrors the quotation form helpers).
  const addItem = () => setItems((prev) => [...prev, createEmptyItem()]);
  const updateItem = (id: string, changes: Partial<QuotationItem>) =>
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const next = { ...it, ...changes };
        next.amount = computeItemAmount(next.quantity, next.price);
        return next;
      })
    );
  const removeItem = (id: string) =>
    setItems((prev) => {
      const left = prev.filter((i) => i.id !== id);
      return left.length ? left : [createEmptyItem()];
    });
  const duplicateItem = (id: string) =>
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: generateId() };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Enter a template name.");
      return;
    }
    const validItems = items.filter((i) => i.name.trim());
    if (validItems.length === 0) {
      toast.error("Add at least one named item.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        items: validItems.map((i) => ({ ...i, name: i.name.trim() })),
        charges,
        gstPercent,
        isSeed: template?.isSeed,
      };
      if (template) {
        await templateService.update(template.id, payload);
        toast.success("Template updated.");
      } else {
        await templateService.create(payload);
        toast.success("Template created.");
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "New Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Template Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gaming PC Build"
              />
            </FormField>
            <FormField label="Category">
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. New Build"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
            />
          </FormField>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Items</h4>
            <ItemsTable
              items={items}
              currencySymbol={currencySymbol}
              onAdd={addItem}
              onUpdate={updateItem}
              onRemove={removeItem}
              onDuplicate={duplicateItem}
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Default Charges & GST</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {CHARGE_FIELDS.map((field) => (
                <FormField key={field.key} label={field.label}>
                  <NumberInput
                    value={charges[field.key]}
                    onValueChange={(v) =>
                      setCharges((prev) => ({ ...prev, [field.key]: v }))
                    }
                    prefix={currencySymbol}
                  />
                </FormField>
              ))}
              <FormField label="GST %">
                <NumberInput
                  value={gstPercent}
                  onValueChange={setGstPercent}
                />
              </FormField>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
