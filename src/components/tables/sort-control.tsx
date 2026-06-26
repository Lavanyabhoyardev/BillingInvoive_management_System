"use client";

import { ArrowDownUp } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuotationSortField } from "@/services";
import type { SortDirection } from "@/types";

export interface SortState {
  field: QuotationSortField;
  direction: SortDirection;
}

interface SortOption {
  label: string;
  field: QuotationSortField;
  direction: SortDirection;
}

const OPTIONS: SortOption[] = [
  { label: "Newest first", field: "createdAt", direction: "desc" },
  { label: "Oldest first", field: "createdAt", direction: "asc" },
  { label: "Date (newest)", field: "date", direction: "desc" },
  { label: "Date (oldest)", field: "date", direction: "asc" },
  { label: "Customer (A–Z)", field: "customer", direction: "asc" },
  { label: "Customer (Z–A)", field: "customer", direction: "desc" },
  { label: "Amount (high–low)", field: "grandTotal", direction: "desc" },
  { label: "Amount (low–high)", field: "grandTotal", direction: "asc" },
];

function keyOf(s: SortState) {
  return `${s.field}:${s.direction}`;
}

/** Sort selector for quotation/draft lists. */
export function SortControl({
  value,
  onChange,
}: {
  value: SortState;
  onChange: (next: SortState) => void;
}) {
  return (
    <Select
      value={keyOf(value)}
      onValueChange={(v) => {
        const [field, direction] = v.split(":") as [
          QuotationSortField,
          SortDirection,
        ];
        onChange({ field, direction });
      }}
    >
      <SelectTrigger className="w-[180px]">
        <ArrowDownUp className="mr-1 h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={keyOf(opt)} value={keyOf(opt)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
