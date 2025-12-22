"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  QrCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditCardForm } from "./CreditCardForm";
import { PromptPayQR } from "./PromptPayQR";
import { paymentService } from "@/services";
import { isOmiseConfigured } from "@/lib/omise";
import type {
  PaymentModalProps,
  PaymentMethod,
  Transaction,
} from "@/types/payment";

type Step =
  | "select"
  | "card"
  | "promptpay"
  | "processing"
  | "success"
  | "error";

export function PaymentModal({
  isOpen,
  onClose,
  type,
  amount,
  propertyId,
  description,
  featuredDays,
  onSuccess,
  onError,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if Omise is configured
  const omiseConfigured = isOmiseConfigured();

  // Get display info based on transaction type
  const getTypeInfo = () => {
    switch (type) {
      case "booking_deposit":
        return {
          title: "ชำระค่ามัดจำ",
          icon: "🏠",
          color: "from-emerald-500 to-teal-500",
        };
      case "agent_fee":
        return {
          title: "ชำระค่าธรรมเนียม Agent",
          icon: "👤",
          color: "from-blue-500 to-indigo-500",
        };
      case "featured_listing":
        return {
          title: "โปรโมทประกาศ",
          icon: "⭐",
          color: "from-amber-500 to-orange-500",
        };
    }
  };

  const typeInfo = getTypeInfo();

  // Handle credit card token created
  const handleCardTokenCreated = async (token: string) => {
    setIsProcessing(true);
    setStep("processing");

    try {
      const result = await paymentService.createPayment({
        type,
        amount,
        paymentMethod: "credit_card",
        propertyId,
        description,
        cardToken: token,
        featuredDays,
        returnUri: window.location.href,
      });

      setTransaction(result.transaction);

      // Check if 3D Secure is required
      if (result.authorizeUri) {
        // Redirect to 3D Secure page
        window.location.href = result.authorizeUri;
        return;
      }

      // Check transaction status
      if (result.transaction.status === "successful") {
        setStep("success");
        onSuccess?.(result.transaction);
      } else {
        // Poll for status
        const updated = await paymentService.pollTransactionStatus(
          result.transaction.id,
          10,
          2000
        );
        setTransaction(updated);

        if (updated.status === "successful") {
          setStep("success");
          onSuccess?.(updated);
        } else {
          throw new Error(updated.failureMessage || "การชำระเงินล้มเหลว");
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "การชำระเงินล้มเหลว กรุณาลองใหม่";
      setErrorMessage(message);
      setStep("error");
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle PromptPay selection
  const handlePromptPaySelect = async () => {
    setSelectedMethod("promptpay");
    setIsProcessing(true);
    setStep("processing");

    try {
      const result = await paymentService.createPayment({
        type,
        amount,
        paymentMethod: "promptpay",
        propertyId,
        description,
        featuredDays,
        returnUri: window.location.href,
      });

      setTransaction(result.transaction);

      if (result.qrCodeUrl) {
        setQrCodeUrl(result.qrCodeUrl);
        setStep("promptpay");
      } else {
        throw new Error("ไม่สามารถสร้าง QR Code ได้");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setErrorMessage(message);
      setStep("error");
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment complete (from PromptPay)
  const handlePaymentComplete = (updatedTransaction: Transaction) => {
    setTransaction(updatedTransaction);
    setStep("success");
    onSuccess?.(updatedTransaction);
  };

  // Handle payment failed
  const handlePaymentFailed = (error: string) => {
    setErrorMessage(error);
    setStep("error");
    onError?.(error);
  };

  // Reset modal
  const handleReset = () => {
    setStep("select");
    setSelectedMethod(null);
    setTransaction(null);
    setQrCodeUrl(null);
    setIsProcessing(false);
    setErrorMessage(null);
  };

  // Handle close
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Can go back?
  const canGoBack = step === "card";

  // Handle back
  const handleBack = () => {
    setStep("select");
    setSelectedMethod(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget && step !== "processing") {
            handleClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div
            className={`p-6 bg-gradient-to-r ${typeInfo.color} text-white relative`}
          >
            {canGoBack && (
              <button
                onClick={handleBack}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleClose}
              disabled={step === "processing"}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-4xl mb-2 block">{typeInfo.icon}</span>
              <h2 className="text-xl font-bold">{typeInfo.title}</h2>
              <p className="text-white/80 mt-1">
                จำนวน{" "}
                <span className="font-semibold">
                  ฿{amount.toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!omiseConfigured ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ระบบชำระเงินยังไม่พร้อมใช้งาน
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่า Omise API Key
                </p>
                <Button
                  onClick={handleClose}
                  className="mt-4"
                  variant="outline"
                >
                  ปิด
                </Button>
              </div>
            ) : step === "select" ? (
              /* Payment Method Selection */
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-6">
                  เลือกวิธีการชำระเงิน
                </h3>

                {/* Credit Card Option */}
                <button
                  onClick={() => {
                    setSelectedMethod("credit_card");
                    setStep("card");
                  }}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl
                    hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20
                    transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 
                      flex items-center justify-center text-white shadow-lg 
                      group-hover:scale-110 transition-transform"
                    >
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        บัตรเครดิต / บัตรเดบิต
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Visa, Mastercard, JCB
                      </p>
                    </div>
                  </div>
                </button>

                {/* PromptPay Option */}
                <button
                  onClick={handlePromptPaySelect}
                  disabled={isProcessing}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl
                    hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20
                    transition-all duration-200 group text-left
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 
                      flex items-center justify-center text-white shadow-lg 
                      group-hover:scale-110 transition-transform"
                    >
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        PromptPay QR Code
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        สแกนจ่ายผ่านแอปธนาคาร
                      </p>
                    </div>
                  </div>
                </button>

                {/* Security Note */}
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                  🔒 ข้อมูลการชำระเงินได้รับการเข้ารหัสและปลอดภัย
                </p>
              </div>
            ) : step === "card" ? (
              /* Credit Card Form */
              <CreditCardForm
                onTokenCreated={handleCardTokenCreated}
                isProcessing={isProcessing}
                amount={amount}
              />
            ) : step === "promptpay" && transaction && qrCodeUrl ? (
              /* PromptPay QR */
              <PromptPayQR
                transaction={transaction}
                qrCodeUrl={qrCodeUrl}
                onPaymentComplete={handlePaymentComplete}
                onPaymentFailed={handlePaymentFailed}
              />
            ) : step === "processing" ? (
              /* Processing */
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  กำลังดำเนินการ...
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  กรุณารอสักครู่
                </p>
              </div>
            ) : step === "success" ? (
              /* Success */
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 
                    flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  ชำระเงินสำเร็จ!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  ขอบคุณสำหรับการชำระเงิน
                </p>

                {transaction && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      หมายเลขธุรกรรม
                    </p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">
                      {transaction.id}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                >
                  เสร็จสิ้น
                </Button>
              </div>
            ) : step === "error" ? (
              /* Error */
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-rose-500 
                    flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30"
                >
                  <AlertCircle className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  การชำระเงินล้มเหลว
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {errorMessage || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"}
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1"
                  >
                    ปิด
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                  >
                    ลองใหม่
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer - Omise Badge */}
          {step !== "success" && step !== "error" && (
            <div className="px-6 pb-4 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Powered by <span className="font-semibold">Omise</span> ·
                ระบบชำระเงินที่ปลอดภัย
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PaymentModal;
