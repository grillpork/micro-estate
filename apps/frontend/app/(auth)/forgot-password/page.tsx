"use client";

import { useState } from "react";

import { AuthLayout } from "@/components/layout";
import {
  ForgotPasswordForm,
  ForgotPasswordSuccess,
} from "@/components/forms/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSuccess = (email: string) => {
    setSubmittedEmail(email);
    setIsSubmitted(true);
  };

  const handleResend = () => {
    setIsSubmitted(false);
    setSubmittedEmail("");
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="ตรวจสอบอีเมลของคุณ"
        description="เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว"
      >
        <ForgotPasswordSuccess email={submittedEmail} onResend={handleResend} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="ลืมรหัสผ่าน?"
      description="กรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้"
    >
      <ForgotPasswordForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
