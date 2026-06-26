"use client";

import * as React from "react";
import { Download, Upload, DatabaseBackup, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { backupService } from "@/services";
import { downloadBlob } from "@/utils";

/** Export / import the whole database as a JSON backup file. */
export function BackupRestore() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const { confirm, dialog } = useConfirm();

  async function handleExport() {
    setBusy(true);
    try {
      const data = await backupService.export();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `quotedesk-backup-${stamp}.json`);
      toast.success("Backup downloaded.");
    } catch (err) {
      console.error(err);
      toast.error("Backup failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!backupService.isValid(data)) {
        toast.error("This is not a valid QuoteDesk backup file.");
        return;
      }
      const replace = await confirm({
        title: "Restore this backup?",
        description:
          "Choose Replace to wipe current data and restore the backup exactly. (Cancel keeps your data.)",
        confirmLabel: "Replace all",
        cancelLabel: "Cancel",
        destructive: true,
      });
      await backupService.import(data, replace ? "replace" : "merge");
      toast.success("Backup restored.");
    } catch (err) {
      console.error(err);
      toast.error("Could not read the backup file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleClearAll() {
    const ok = await confirm({
      title: "Delete ALL data?",
      description:
        "This permanently removes every quotation, invoice, estimate and template. Your company profile stays. Take a backup first!",
      confirmLabel: "Delete everything",
      destructive: true,
    });
    if (!ok) return;
    await backupService.clearAll();
    toast.success("All documents deleted.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DatabaseBackup className="h-4 w-4 text-primary" />
            Backup & Restore
          </CardTitle>
          <CardDescription>
            Your data is stored offline in this browser. Download a backup file
            to keep it safe or move it to another device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleExport} disabled={busy}>
            <Download className="h-4 w-4" />
            Download Backup
          </Button>

          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <Upload className="h-4 w-4" />
            Restore from File
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete all documents. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={handleClearAll}
            disabled={busy}
          >
            <Trash2 className="h-4 w-4" />
            Delete All Data
          </Button>
        </CardContent>
      </Card>

      {dialog}
    </div>
  );
}
