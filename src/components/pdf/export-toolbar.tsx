"use client";

import * as React from "react";
import { FileDown, FileImage, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportToImage,
  exportToPdf,
  printDocument,
} from "@/lib/export/export-document";

interface ExportToolbarProps {
  /** Ref to the printable document element. */
  targetRef: React.RefObject<HTMLElement | null>;
  filename: string;
}

type Busy = "pdf" | "png" | "jpeg" | null;

/** PDF / Image / Print actions for the quotation document. */
export function ExportToolbar({ targetRef, filename }: ExportToolbarProps) {
  const [busy, setBusy] = React.useState<Busy>(null);

  async function run(kind: Exclude<Busy, null>, fn: () => Promise<void>) {
    if (!targetRef.current) {
      toast.error("Document is not ready yet.");
      return;
    }
    setBusy(kind);
    try {
      await fn();
      toast.success("Export ready.");
    } catch (err) {
      console.error(err);
      toast.error("Export failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <Button
        onClick={() =>
          run("pdf", () => exportToPdf(targetRef.current!, filename))
        }
        disabled={busy !== null}
      >
        {busy === "pdf" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        Generate PDF
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={busy !== null}>
            {busy === "png" || busy === "jpeg" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileImage className="h-4 w-4" />
            )}
            Generate Image
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              run("png", () =>
                exportToImage(targetRef.current!, filename, "png")
              )
            }
          >
            Download PNG
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              run("jpeg", () =>
                exportToImage(targetRef.current!, filename, "jpeg")
              )
            }
          >
            Download JPEG
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        onClick={() => printDocument()}
        disabled={busy !== null}
      >
        <Printer className="h-4 w-4" />
        Print
      </Button>
    </div>
  );
}
