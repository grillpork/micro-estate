"use client";

import * as React from "react";
import { Field, type ReactFormExtendedApi } from "@tanstack/react-form";
import { ZodType } from "zod";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  validator?: ZodType;
  disabled?: boolean;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: (field: any) => React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validators?: any;
}

export function FormField({
  form,
  name,
  label,
  placeholder,
  type = "text",
  icon,
  validator,
  validators,
  disabled,
  className,
  children,
}: FormFieldProps) {
  return (
    <Field
      form={form}
      name={name}
      validators={
        validators ||
        (validator
          ? {
              onChange: ({ value }) => {
                const res = validator.safeParse(value);
                if (!res.success) return res.error.issues[0].message;
              },
            }
          : undefined)
      }
    >
      {(field) => (
        <div className={cn("space-y-2", className)}>
          <label htmlFor={name} className="text-sm font-medium">
            {label}
          </label>
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {icon}
              </div>
            )}
            {children ? (
              children(field)
            ) : (
              <Input
                id={name}
                type={type}
                placeholder={placeholder}
                className={cn(icon && "pl-10")}
                value={(field.state.value as string) || ""} // Fix: Ensure value is string
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={disabled}
              />
            )}
          </div>
          {field.state.meta.errors ? (
            <p className="text-xs text-destructive">
              {field.state.meta.errors.join(", ")}
            </p>
          ) : null}
        </div>
      )}
    </Field>
  );
}
