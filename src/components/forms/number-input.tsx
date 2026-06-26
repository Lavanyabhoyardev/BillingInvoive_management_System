"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { parseAmount } from "@/utils";

interface NumberInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> {
  value: number;
  onValueChange: (value: number) => void;
  allowDecimals?: boolean;
  allowNegative?: boolean;
  prefix?: string;
}

/**
 * Controlled numeric input that keeps a clean editing experience:
 * shows an empty string instead of a leading 0, and commits a parsed number.
 */
export function NumberInput({
  value,
  onValueChange,
  allowDecimals = true,
  allowNegative = false,
  prefix,
  className,
  onFocus,
  ...props
}: NumberInputProps) {
  const [text, setText] = React.useState<string>(value ? String(value) : "");

  // Sync external value changes (e.g. template load) when not focused.
  const focusedRef = React.useRef(false);
  React.useEffect(() => {
    if (!focusedRef.current) {
      setText(value ? String(value) : "");
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const pattern = allowDecimals
      ? allowNegative
        ? /^-?\d*\.?\d*$/
        : /^\d*\.?\d*$/
      : allowNegative
        ? /^-?\d*$/
        : /^\d*$/;
    if (raw === "" || pattern.test(raw)) {
      setText(raw);
      onValueChange(parseAmount(raw, allowNegative));
    }
  }

  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        inputMode={allowDecimals ? "decimal" : "numeric"}
        value={text}
        onChange={handleChange}
        onFocus={(e) => {
          focusedRef.current = true;
          e.target.select();
          onFocus?.(e);
        }}
        onBlur={() => {
          focusedRef.current = false;
          setText(value ? String(value) : "");
        }}
        className={cn(prefix && "pl-7", "text-right tabular-nums", className)}
        {...props}
      />
    </div>
  );
}
