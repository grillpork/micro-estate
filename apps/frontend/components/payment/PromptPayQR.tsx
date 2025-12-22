"use client";

import { useState, useEffect } from "react";
import {
  QrCode,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentService } from "@/services";
import type { Transaction, TransactionStatus } from "@/types/payment";

interface PromptPayQRProps {
  transaction: Transaction;
  qrCodeUrl: string;
  onPaymentComplete: (transaction: Transaction) => void;
  onPaymentFailed: (error: string) => void;
}

export function PromptPayQR({
  transaction: initialTransaction,
  qrCodeUrl,
  onPaymentComplete,
  onPaymentFailed,
}: PromptPayQRProps) {
  const [transaction, setTransaction] = useState(initialTransaction);
  const [isPolling, setIsPolling] = useState(true);
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds

  // Poll transaction status
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const updated = await paymentService.getTransactionById(transaction.id);
        setTransaction(updated);

        if (updated.status === "successful") {
          setIsPolling(false);
          onPaymentComplete(updated);
        } else if (
          updated.status === "failed" ||
          updated.status === "expired"
        ) {
          setIsPolling(false);
          onPaymentFailed(
            updated.failureMessage || "การชำระเงินล้มเหลวหรือหมดอายุ"
          );
        }
      } catch (error) {
        console.error("Failed to poll transaction:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, transaction.id, onPaymentComplete, onPaymentFailed]);

  // Countdown timer
  useEffect(() => {
    if (!isPolling || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsPolling(false);
          onPaymentFailed("QR Code หมดอายุ กรุณาสร้างใหม่");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPolling, countdown, onPaymentFailed]);

  // Format countdown
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Download QR code
  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `promptpay-qr-${transaction.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download QR:", error);
    }
  };

  // Status indicator component
  const StatusIndicator = ({ status }: { status: TransactionStatus }) => {
    switch (status) {
      case "successful":
        return (
          <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-semibold">ชำระเงินสำเร็จ!</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="w-6 h-6" />
            <span className="font-semibold">การชำระเงินล้มเหลว</span>
          </div>
        );
      case "expired":
        return (
          <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
            <Clock className="w-6 h-6" />
            <span className="font-semibold">QR Code หมดอายุ</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">รอการชำระเงิน...</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-2">
          <QrCode className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          สแกน QR Code เพื่อชำระเงิน
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          เปิดแอปธนาคารของคุณและสแกน QR Code ด้านล่าง
        </p>
      </div>

      {/* Amount */}
      <div className="py-4 px-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          จำนวนเงินที่ต้องชำระ
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          ฿{parseFloat(transaction.amount).toLocaleString()}
        </p>
      </div>

      {/* QR Code */}
      <div className="relative">
        {transaction.status === "processing" ||
        transaction.status === "pending" ? (
          <>
            <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
              <img
                src={qrCodeUrl}
                alt="PromptPay QR Code"
                className="w-64 h-64 object-contain"
              />
            </div>

            {/* Countdown */}
            <div className="mt-4 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                QR Code หมดอายุใน{" "}
                <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                  {formatCountdown(countdown)}
                </span>
              </span>
            </div>

            {/* Download Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadQR}
              className="mt-3"
            >
              <Download className="w-4 h-4 mr-2" />
              ดาวน์โหลด QR Code
            </Button>
          </>
        ) : (
          <div className="w-64 h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <StatusIndicator status={transaction.status} />
          </div>
        )}
      </div>

      {/* Status */}
      <StatusIndicator status={transaction.status} />

      {/* Instructions */}
      {(transaction.status === "processing" ||
        transaction.status === "pending") && (
        <div className="w-full max-w-sm space-y-3">
          <div className="text-left text-sm space-y-2">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              วิธีการชำระเงิน:
            </p>
            <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>เปิดแอปธนาคารของคุณ</li>
              <li>เลือกเมนู &quot;สแกน QR&quot; หรือ &quot;จ่ายบิล&quot;</li>
              <li>สแกน QR Code ด้านบน</li>
              <li>ตรวจสอบจำนวนเงินและยืนยันการชำระ</li>
            </ol>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                หน้านี้จะอัปเดตอัตโนมัติเมื่อการชำระเงินสำเร็จ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Retry Button for Failed/Expired */}
      {(transaction.status === "failed" ||
        transaction.status === "expired") && (
        <Button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          ลองใหม่อีกครั้ง
        </Button>
      )}
    </div>
  );
}

export default PromptPayQR;
