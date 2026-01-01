"use client";

import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<
  NumericFormatProps,
  "value" | "onValueChange" | "customInput"
> {
  value?: number | string;
  onValueChange: (value: number | undefined) => void;
  suffix?: string;
  className?: string; // Add className support
}

export function NumberInput({
  value,
  onValueChange,
  suffix,
  className,
  ...props
}: NumberInputProps) {
  return (
    <div className="relative">
      <NumericFormat
        value={value}
        onValueChange={(values) => {
          onValueChange(values.floatValue);
        }}
        thousandSeparator=","
        allowNegative={false}
        customInput={Input}
        className={cn(
          "h-12 rounded-xl text-base",
          suffix && "pr-12",
          className
        )}
        {...props}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          {suffix}
        </div>
      )}
    </div>
  );
}
