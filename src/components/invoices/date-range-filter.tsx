"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toDateInputValue } from "@/utils";
import type { InvoiceDateRange } from "@/services";

export type RangePreset = "all" | "today" | "week" | "month" | "custom";

interface DateRangeFilterProps {
  preset: RangePreset;
  range: InvoiceDateRange;
  onChange: (preset: RangePreset, range: InvoiceDateRange) => void;
}

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

/** Computes a date range for a preset. */
export function rangeForPreset(preset: RangePreset): InvoiceDateRange {
  const now = new Date();
  const today = toDateInputValue(now);
  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "week": {
      const d = new Date(now);
      const day = (d.getDay() + 6) % 7; // Monday = 0
      d.setDate(d.getDate() - day);
      return { from: toDateInputValue(d), to: today };
    }
    case "month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toDateInputValue(d), to: today };
    }
    default:
      return {};
  }
}

/** Today / Week / Month / Custom date-range filter for invoices. */
export function DateRangeFilter({
  preset,
  range,
  onChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() =>
              onChange(
                p.key,
                p.key === "custom" ? range : rangeForPreset(p.key)
              )
            }
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              preset === p.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={range.from ?? ""}
            onChange={(e) =>
              onChange("custom", { ...range, from: e.target.value || undefined })
            }
            className="w-auto"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            value={range.to ?? ""}
            onChange={(e) =>
              onChange("custom", { ...range, to: e.target.value || undefined })
            }
            className="w-auto"
          />
          {(range.from || range.to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("custom", {})}
            >
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
