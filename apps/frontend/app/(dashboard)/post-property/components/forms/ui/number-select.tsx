"use client";

import { SelectField } from "./select-field";

interface NumberSelectProps {
  value?: number | string;
  onChange: (value: number) => void;
  max?: number;
  placeholder?: string;
  suffix?: string;
  className?: string; // Add className support
}

export function NumberSelect({
  value,
  onChange,
  max = 10,
  placeholder,
  suffix = "",
  className,
}: NumberSelectProps) {
  const options = Array.from({ length: max }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}${suffix}`,
  }));

  return (
    <SelectField
      value={value?.toString()}
      onChange={(val) => onChange(Number(val))}
      options={options}
      placeholder={placeholder}
      className={className}
    />
  );
}
