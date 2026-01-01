"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AuthLayout } from "@/components/layout";
import { Spinner } from "@/components/ui";
import {
  ResetPasswordForm,
  ResetPasswordSuccess,
  ResetPasswordInvalidToken,
} from "@/components/forms/auth/reset-password-form";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);

  const handleSuccess = useCallback(() => {
    setIsSuccess(true);
  }, []);

  const handleInvalidToken = useCallback(() => {
    setIsInvalidToken(true);
  }, []);

  if (isInvalidToken) {
    return (
      <AuthLayout
        title="ลิงก์ไม่ถูกต้อง"
        description="ลิงก์รีเซ็ตรหัสผ่านนี้ไม่ถูกต้องหรือหมดอายุแล้ว"
      >
        <ResetPasswordInvalidToken />
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="รีเซ็ตรหัสผ่านสำเร็จ!"
        description="รหัสผ่านของคุณได้ถูกเปลี่ยนแล้ว"
      >
        <ResetPasswordSuccess />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="ตั้งรหัสผ่านใหม่"
      description="กรอกรหัสผ่านใหม่ของคุณด้านล่าง"
    >
      <ResetPasswordForm
        token={token}
        onSuccess={handleSuccess}
        onInvalidToken={handleInvalidToken}
      />
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="กำลังโหลด..." description="">
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
