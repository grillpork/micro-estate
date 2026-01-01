"use client";

import { useEffect, useState } from "react";
import { PropertyForm } from "@/components/features/property/PropertyForm";
import {
  verificationService,
  VerificationStatus,
} from "@/services/verification.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreatePropertyPage() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificationService
      .getStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container max-w-2xl py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 w-full bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const needsVerification =
    status && !status.canCreateListing && status.verificationLevel === "none";

  return (
    <div className="container max-w-2xl py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">ลงประกาศอสังหาริมทรัพย์</h1>

      {needsVerification ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ต้องยืนยันตัวตนก่อนเพิ่มประกาศ</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>
              คุณได้ใช้โควตาประกาศฟรี (1 รายการ) ครบแล้ว
              กรุณายืนยันตัวตนเพื่อเพิ่มขีดจำกัดในการลงประกาศได้สูงสุด 10 รายการ
            </p>
            <Button
              asChild
              variant="outline"
              className="bg-white text-destructive hover:bg-gray-100"
            >
              <Link href="/profile">ไปที่หน้ายืนยันตัวตน</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {!status?.canCreateListing && (
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle>ขีดจำกัดการประกาศเต็มแล้ว</AlertTitle>
              <AlertDescription>
                คุณลงประกาศครบ {status?.maxListings}{" "}
                รายการแล้วตามระดับการยืนยันตัวตนของคุณในปัจจุบัน
              </AlertDescription>
            </Alert>
          )}

          {status?.canCreateListing && (
            <>
              {status.verificationLevel === "none" && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-6">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <AlertTitle>คำแนะนำ</AlertTitle>
                  <AlertDescription>
                    คุณสามารถลงประกาศได้อีก{" "}
                    {status.maxListings - status.currentListings} รายการ
                    ยืนยันตัวตนเพิ่มเพื่อรับสิทธิประโยชน์และโควตาที่มากขึ้น
                  </AlertDescription>
                </Alert>
              )}
              <PropertyForm />
            </>
          )}
        </div>
      )}
    </div>
  );
}
