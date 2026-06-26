"use client";

import * as React from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fileToDataUrl } from "@/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
  /** Aspect/preview style. */
  variant?: "logo" | "wide" | "square";
  maxSizeMb?: number;
  className?: string;
}

const VARIANT_CLASS: Record<NonNullable<ImageUploadProps["variant"]>, string> = {
  logo: "h-24 w-24",
  square: "h-32 w-32",
  wide: "h-32 w-full max-w-xs",
};

/** Reusable image picker that stores images as base64 data URLs (offline-safe). */
export function ImageUpload({
  value,
  onChange,
  label = "Upload image",
  variant = "logo",
  maxSizeMb = 2,
  className,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxSizeMb} MB.`);
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch {
      toast.error("Could not read the image.");
    }
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/40",
          VARIANT_CLASS[variant]
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={label}
            className="h-full w-full object-contain"
          />
        ) : (
          <ImagePlus className="h-7 w-7 text-muted-foreground" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {value ? "Replace" : label}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              onChange(undefined);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
