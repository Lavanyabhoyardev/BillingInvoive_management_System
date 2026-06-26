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
import { templateService } from "@/services";
import type { AdditionalCharges, QuotationItem } from "@/types";

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: QuotationItem[];
  charges: AdditionalCharges;
  gstPercent: number;
}

/** Saves the current builder items/charges as a reusable template. */
export function SaveTemplateDialog({
  open,
  onOpenChange,
  items,
  charges,
  gstPercent,
}: SaveTemplateDialogProps) {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName("");
      setCategory("");
      setDescription("");
    }
  }, [open]);

  const validItems = items.filter((i) => i.name.trim());

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Please enter a template name.");
      return;
    }
    if (validItems.length === 0) {
      toast.error("Add at least one named item before saving a template.");
      return;
    }
    try {
      setSaving(true);
      await templateService.create({
        name: name.trim(),
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        items: validItems.map((i) => ({ ...i })),
        charges,
        gstPercent,
        isSeed: false,
      });
      toast.success(`Template "${name.trim()}" saved.`);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <FormField label="Template Name" required>
            <Input
              autoFocus
              placeholder="e.g. Gaming PC Build"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>
          <FormField label="Category" hint="Optional grouping">
            <Input
              placeholder="e.g. New Build, Repair, CCTV"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              rows={2}
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>
          <p className="text-xs text-muted-foreground">
            Saving {validItems.length} item
            {validItems.length === 1 ? "" : "s"} with current charges & GST.
          </p>
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
