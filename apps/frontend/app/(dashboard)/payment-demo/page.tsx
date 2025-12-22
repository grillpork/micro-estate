"use client";

/**
 * Payment Demo Page
 * This page is for testing the payment flow in development
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/payment";
import { usePayment } from "@/hooks/usePayment";
import { toast } from "sonner";
import { CreditCard, Star, Home, CheckCircle } from "lucide-react";
import type { TransactionType, Transaction } from "@/types/payment";

interface PaymentOption {
  type: TransactionType;
  title: string;
  description: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
  featuredDays?: number;
}

export default function PaymentDemoPage() {
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(
    null
  );

  const { modalProps, openPayment } = usePayment({
    onSuccess: (transaction) => {
      setLastTransaction(transaction);
      toast.success("ชำระเงินสำเร็จ!");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const paymentOptions: PaymentOption[] = [
    {
      type: "booking_deposit",
      title: "มัดจำจองอสังหา",
      description: "สำหรับจองอสังหาริมทรัพย์ที่สนใจ",
      amount: 10000,
      icon: <Home className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-500",
    },
    {
      type: "agent_fee",
      title: "ค่าธรรมเนียม Agent",
      description: "สมัครเป็น Agent เพื่อลงประกาศ",
      amount: 1500,
      icon: <CreditCard className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-500",
    },
    {
      type: "featured_listing",
      title: "โปรโมทประกาศ 7 วัน",
      description: "ทำให้ประกาศของคุณโดดเด่นกว่าใคร",
      amount: 299,
      icon: <Star className="w-6 h-6" />,
      color: "from-amber-500 to-orange-500",
      featuredDays: 7,
    },
    {
      type: "featured_listing",
      title: "โปรโมทประกาศ 30 วัน",
      description: "โปรโมทระยะยาว คุ้มค่ากว่า",
      amount: 899,
      icon: <Star className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      featuredDays: 30,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            🔧 Payment Demo (Development)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ทดสอบระบบชำระเงินผ่าน Omise ในโหมด Development
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-300 text-sm">
            <span>⚠️ ใช้บัตรทดสอบ: 4242 4242 4242 4242</span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {paymentOptions.map((option, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow"
            >
              {/* Card Header */}
              <div
                className={`p-4 bg-gradient-to-r ${option.color} text-white flex items-center gap-3`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{option.title}</h3>
                  <p className="text-white/80 text-sm">{option.description}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  ฿{option.amount.toLocaleString()}
                </p>
                <Button
                  onClick={() =>
                    openPayment({
                      type: option.type,
                      amount: option.amount,
                      description: option.title,
                      featuredDays: option.featuredDays,
                      // In real usage, you would pass propertyId
                      propertyId:
                        option.type !== "agent_fee"
                          ? "demo-property-id"
                          : undefined,
                    })
                  }
                  className={`w-full bg-gradient-to-r ${option.color} text-white font-semibold hover:opacity-90 transition-opacity`}
                >
                  ชำระเงินเลย
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Test Cards Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📝 บัตรทดสอบ (Test Cards)
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  4242 4242 4242 4242
                </p>
                <p className="text-xs text-gray-500">Successful payment</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  4111 1111 1111 1111
                </p>
                <p className="text-xs text-gray-500">3D Secure required</p>
              </div>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  4000 0000 0000 0002
                </p>
                <p className="text-xs text-gray-500">Declined payment</p>
              </div>
              <span className="text-red-500 text-sm">✕</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              * ใช้ MM/YY อะไรก็ได้ในอนาคต และ CVV 3 หลักใดๆ
            </p>
          </div>
        </div>

        {/* Last Transaction */}
        {lastTransaction && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              ธุรกรรมล่าสุด
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ID:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {lastTransaction.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  ประเภท:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {lastTransaction.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  จำนวนเงิน:
                </span>
                <span className="text-gray-900 dark:text-white">
                  ฿{parseFloat(lastTransaction.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">สถานะ:</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  {lastTransaction.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal {...modalProps} />
    </div>
  );
}
