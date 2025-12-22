"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { authClient } from "@/services";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.email("กรุณากรอกอีเมลให้ถูกต้อง"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Use better-auth client method
      const result = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (result.error) {
        console.error("Request password reset error:", result.error);
      }

      // Always show success (security: don't reveal if email exists)
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Request password reset exception:", error);
      // Still show success for security
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="ตรวจสอบอีเมลของคุณ"
        description="เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              หากมีบัญชีที่เชื่อมโยงกับ{" "}
              <span className="font-medium text-foreground">
                {submittedEmail}
              </span>{" "}
              คุณจะได้รับอีเมลพร้อมลิงก์สำหรับรีเซ็ตรหัสผ่าน
            </p>
            <p className="text-xs text-muted-foreground">
              หากไม่พบอีเมล กรุณาตรวจสอบในโฟลเดอร์สแปม
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsSubmitted(false);
                setSubmittedEmail("");
              }}
            >
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
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="ลืมรหัสผ่าน?"
      description="กรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            อีเมล
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="pl-10"
              {...register("email")}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
        </Button>

        {/* Back to Sign In */}
        <Link href="/sign-in">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}
