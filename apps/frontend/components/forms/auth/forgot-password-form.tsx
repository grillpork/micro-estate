"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui";
import { FormField } from "@/components/ui/form-field";
import { authClient } from "@/services";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    } as ForgotPasswordFormData,
    onSubmit: async ({ value }: { value: ForgotPasswordFormData }) => {
      setIsLoading(true);
      try {
        // Use better-auth client method
        const result = await authClient.requestPasswordReset({
          email: value.email,
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (result.error) {
          console.error("Request password reset error:", result.error);
        }

        // Always show success (security: don't reveal if email exists)
        onSuccess?.(value.email);
      } catch (error) {
        console.error("Request password reset exception:", error);
        // Still show success for security
        onSuccess?.(value.email);
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
      {/* Email */}
      <FormField
        form={form}
        name="email"
        label="อีเมล"
        placeholder="your@email.com"
        type="email"
        icon={<Mail className="h-4 w-4" />}
        validator={forgotPasswordSchema.shape.email}
        disabled={isLoading}
      />

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
              ? "กำลังส่ง..."
              : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
          </Button>
        )}
      />

      {/* Back to Sign In */}
      <Link href="/sign-in">
        <Button variant="ghost" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปหน้าเข้าสู่ระบบ
        </Button>
      </Link>
    </form>
  );
}

interface ForgotPasswordSuccessProps {
  email: string;
  onResend: () => void;
}

export function ForgotPasswordSuccess({
  email,
  onResend,
}: ForgotPasswordSuccessProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
        <CheckCircle className="h-8 w-8 text-green-500" />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          หากมีบัญชีที่เชื่อมโยงกับ{" "}
          <span className="font-medium text-foreground">{email}</span>{" "}
          คุณจะได้รับอีเมลพร้อมลิงก์สำหรับรีเซ็ตรหัสผ่าน
        </p>
        <p className="text-xs text-muted-foreground">
          หากไม่พบอีเมล กรุณาตรวจสอบในโฟลเดอร์สแปม
        </p>
      </div>

      <div className="space-y-3">
        <Button variant="outline" className="w-full" onClick={onResend}>
          ส่งอีกครั้ง
        </Button>

        <Link href="/sign-in">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </Link>
      </div>
    </div>
  );
}
