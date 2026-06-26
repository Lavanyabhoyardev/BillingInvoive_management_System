"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NumberInput } from "@/components/forms/number-input";
import { ITEM_UNITS, type QuotationItem } from "@/types";
import { formatCurrency } from "@/utils";

interface ItemsTableProps {
  items: QuotationItem[];
  currencySymbol: string;
  onAdd: () => void;
  onUpdate: (id: string, changes: Partial<QuotationItem>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

/** Professional editable items table with per-row duplicate/delete. */
export function ItemsTable({
  items,
  currencySymbol,
  onAdd,
  onUpdate,
  onRemove,
  onDuplicate,
}: ItemsTableProps) {
  return (
    <div className="space-y-3">
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="w-10 px-2 py-3" />
              <th className="px-3 py-3">Item</th>
              <th className="w-20 px-3 py-3 text-right">Qty</th>
              <th className="w-28 px-3 py-3">Unit</th>
              <th className="w-32 px-3 py-3 text-right">Price</th>
              <th className="w-32 px-3 py-3 text-right">Amount</th>
              <th className="w-20 px-2 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <motion.tr
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="align-top"
                >
                  <td className="px-2 py-3 text-center text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-4 w-4 opacity-40" />
                      <span className="text-xs tabular-nums">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-1.5">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) =>
                          onUpdate(item.id, { name: e.target.value })
                        }
                        className="font-medium"
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={item.description ?? ""}
                        onChange={(e) =>
                          onUpdate(item.id, { description: e.target.value })
                        }
                        rows={1}
                        className="min-h-0 resize-none text-xs"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <NumberInput
                      value={item.quantity}
                      onValueChange={(v) => onUpdate(item.id, { quantity: v })}
                      allowDecimals
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Select
                      value={item.unit}
                      onValueChange={(v) =>
                        onUpdate(item.id, { unit: v as QuotationItem["unit"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-3">
                    <NumberInput
                      value={item.price}
                      onValueChange={(v) => onUpdate(item.id, { price: v })}
                      prefix={currencySymbol}
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(item.amount, currencySymbol)}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <RowAction
                        label="Duplicate"
                        onClick={() => onDuplicate(item.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </RowAction>
                      <RowAction
                        label="Delete"
                        destructive
                        onClick={() => onRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </RowAction>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3 rounded-xl border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Item {index + 1}
                </span>
                <div className="flex gap-1">
                  <RowAction
                    label="Duplicate"
                    onClick={() => onDuplicate(item.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </RowAction>
                  <RowAction
                    label="Delete"
                    destructive
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </RowAction>
                </div>
              </div>
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => onUpdate(item.id, { name: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={item.description ?? ""}
                onChange={(e) =>
                  onUpdate(item.id, { description: e.target.value })
                }
                rows={2}
                className="text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Qty
                  </label>
                  <NumberInput
                    value={item.quantity}
                    onValueChange={(v) => onUpdate(item.id, { quantity: v })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Unit
                  </label>
                  <Select
                    value={item.unit}
                    onValueChange={(v) =>
                      onUpdate(item.id, { unit: v as QuotationItem["unit"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Price
                  </label>
                  <NumberInput
                    value={item.price}
                    onValueChange={(v) => onUpdate(item.id, { price: v })}
                    prefix={currencySymbol}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Amount
                  </label>
                  <div className="flex h-9 items-center justify-end rounded-md bg-muted px-3 font-semibold tabular-nums">
                    {formatCurrency(item.amount, currencySymbol)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button type="button" variant="outline" onClick={onAdd} className="w-full">
        <Plus className="h-4 w-4" />
        Add Item
      </Button>
    </div>
  );
}

function RowAction({
  label,
  destructive,
  onClick,
  children,
}: {
  label: string;
  destructive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          className={destructive ? "text-destructive hover:text-destructive" : ""}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
