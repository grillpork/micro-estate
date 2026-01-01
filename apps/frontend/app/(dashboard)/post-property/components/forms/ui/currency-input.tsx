"use client";

import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<
  NumericFormatProps,
  "value" | "onChange" | "customInput"
> {
  value?: number | string;
  onValueChange: (value: number | undefined) => void;
}

export function CurrencyInput({
  value,
  onValueChange,
  className,
  ...props
}: CurrencyInputProps) {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        onValueChange(values.floatValue);
      }}
      thousandSeparator=","
      decimalScale={2}
      customInput={Input}
      className={`h-12 rounded-xl text-base ${className || ""}`}
      {...props}
    />
  );
}
