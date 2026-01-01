"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button, Input } from "@/components/ui";
import { FormField } from "@/components/ui/form-field";
import { authClient } from "@/services";

// Validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .regex(/[a-z]/, "ต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว")
      .regex(/[A-Z]/, "ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว")
      .regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string | null;
  onSuccess: () => void;
  onInvalidToken: () => void;
}

export function ResetPasswordForm({
  token,
  onSuccess,
  onInvalidToken,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      onInvalidToken();
    }
  }, [token, onInvalidToken]);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    } as ResetPasswordFormData,
    onSubmit: async ({ value }: { value: ResetPasswordFormData }) => {
      if (!token) return;

      setIsLoading(true);
      try {
        const result = await authClient.resetPassword({
          newPassword: value.password,
          token: token,
        });

        if (result.error) {
          throw new Error(result.error.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้");
        }

        onSuccess();
        toast.success("รีเซ็ตรหัสผ่านสำเร็จ!");

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {/* Password */}
      <FormField
        form={form}
        name="password"
        label="รหัสผ่านใหม่"
        validator={resetPasswordSchema.shape.password}
      >
        {(field) => (
          <>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              ต้องมีอย่างน้อย 8 ตัวอักษร, พิมพ์ใหญ่, พิมพ์เล็ก และตัวเลข
            </p>
          </>
        )}
      </FormField>

      {/* Confirm Password */}
      <FormField
        form={form}
        name="confirmPassword"
        label="ยืนยันรหัสผ่านใหม่"
        validators={{
          onChange: ({ value, fieldApi }: { value: string; fieldApi: any }) => {
            if (value !== fieldApi.form.getFieldValue("password")) {
              return "รหัสผ่านไม่ตรงกัน";
            }
          },
        }}
      >
        {(field) => (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </FormField>

      {/* Submit */}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting
              ? "กำลังรีเซ็ตรหัสผ่าน..."
              : "รีเซ็ตรหัสผ่าน"}
          </Button>
        )}
      />
    </form>
  );
}

export function ResetPasswordSuccess() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
        <CheckCircle className="h-8 w-8 text-green-500" />
      </div>

      <p className="text-sm text-muted-foreground">
        คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว
        <br />
        กำลังนำคุณไปหน้าเข้าสู่ระบบ...
      </p>

      <Link href="/sign-in">
        <Button className="w-full">ไปหน้าเข้าสู่ระบบ</Button>
      </Link>
    </div>
  );
}

export function ResetPasswordInvalidToken() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-8 w-8 text-destructive" />
      </div>

      <p className="text-sm text-muted-foreground">
        กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่
      </p>

      <Link href="/forgot-password">
        <Button className="w-full">ขอลิงก์ใหม่</Button>
      </Link>
    </div>
  );
}
