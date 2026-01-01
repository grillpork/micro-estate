"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#fafafa] dark:bg-black p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">
            Something went wrong!
          </h2>
          <p className="text-muted-foreground font-medium">
            ไม่สามารถโหลดข้อมูลอสังหาริมทรัพย์ได้ในขณะนี้
            <br />
            {error.message || "กรุณาลองใหม่อีกครั้งในภายหลัง"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={() => reset()}
            size="lg"
            className="rounded-full font-bold shadow-lg shadow-primary/20"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            ลองใหม่อีกครั้ง
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-full font-bold border-border/50 hover:bg-accent"
            >
              <Home className="mr-2 h-4 w-4" />
              กลับหน้าแรก
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground/40 font-mono mt-8">
            Error Digest: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
