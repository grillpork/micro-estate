"use client";

import { useState, useCallback } from "react";
import { CreditCard, Lock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createCardToken,
  formatCardNumber,
  getCardBrand,
  validateCardNumber,
  validateExpirationDate,
} from "@/lib/omise";
import type { CardFormData } from "@/types/payment";

interface CreditCardFormProps {
  onTokenCreated: (token: string) => void;
  isProcessing: boolean;
  amount: number;
}

export function CreditCardForm({
  onTokenCreated,
  isProcessing,
  amount,
}: CreditCardFormProps) {
  const [formData, setFormData] = useState<CardFormData>({
    name: "",
    number: "",
    expirationMonth: "",
    expirationYear: "",
    securityCode: "",
  });
  const [errors, setErrors] = useState<Partial<CardFormData>>({});
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [cardBrand, setCardBrand] = useState("unknown");

  // Handle card number change with formatting
  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCardNumber(e.target.value);
      if (formatted.replace(/\s/g, "").length <= 16) {
        setFormData((prev) => ({ ...prev, number: formatted }));
        setCardBrand(getCardBrand(formatted));
        setErrors((prev) => ({ ...prev, number: undefined }));
      }
    },
    []
  );

  // Handle input changes
  const handleChange = useCallback(
    (field: keyof CardFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      },
    []
  );

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<CardFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อบนบัตร";
    }

    if (!validateCardNumber(formData.number)) {
      newErrors.number = "หมายเลขบัตรไม่ถูกต้อง";
    }

    if (
      !validateExpirationDate(formData.expirationMonth, formData.expirationYear)
    ) {
      newErrors.expirationMonth = "วันหมดอายุไม่ถูกต้อง";
    }

    if (!/^\d{3,4}$/.test(formData.securityCode)) {
      newErrors.securityCode = "CVV ไม่ถูกต้อง";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsCreatingToken(true);
    try {
      const token = await createCardToken(formData);
      onTokenCreated(token);
    } catch (error) {
      setErrors({
        number:
          error instanceof Error
            ? error.message
            : "ไม่สามารถสร้าง token ได้ กรุณาลองใหม่",
      });
    } finally {
      setIsCreatingToken(false);
    }
  };

  const isLoading = isCreatingToken || isProcessing;

  // Card brand icons
  const cardBrandIcon = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    jcb: "💳",
    unionpay: "💳",
    unknown: "",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Number */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          หมายเลขบัตร
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.number}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            className={`w-full px-4 py-3 pr-12 border rounded-xl bg-white dark:bg-gray-800 
              text-gray-900 dark:text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${errors.number ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            disabled={isLoading}
            autoComplete="cc-number"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {cardBrand !== "unknown" && (
              <span className="text-lg">
                {cardBrandIcon[cardBrand as keyof typeof cardBrandIcon]}
              </span>
            )}
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        {errors.number && (
          <p className="text-sm text-red-500">{errors.number}</p>
        )}
      </div>

      {/* Cardholder Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ชื่อบนบัตร
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleChange("name")}
          placeholder="JOHN DOE"
          className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 
            text-gray-900 dark:text-white placeholder-gray-400 uppercase
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
          disabled={isLoading}
          autoComplete="cc-name"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Expiry & CVV */}
      <div className="grid grid-cols-3 gap-4">
        {/* Month */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            เดือน
          </label>
          <select
            value={formData.expirationMonth}
            onChange={handleChange("expirationMonth")}
            className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${errors.expirationMonth ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            disabled={isLoading}
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => {
              const month = (i + 1).toString().padStart(2, "0");
              return (
                <option key={month} value={month}>
                  {month}
                </option>
              );
            })}
          </select>
        </div>

        {/* Year */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            ปี
          </label>
          <select
            value={formData.expirationYear}
            onChange={handleChange("expirationYear")}
            className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${errors.expirationMonth ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            disabled={isLoading}
          >
            <option value="">YY</option>
            {Array.from({ length: 15 }, (_, i) => {
              const year = (new Date().getFullYear() + i).toString().slice(-2);
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        {/* CVV */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            CVV
          </label>
          <div className="relative">
            <input
              type="password"
              value={formData.securityCode}
              onChange={handleChange("securityCode")}
              placeholder="•••"
              maxLength={4}
              className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 
                text-gray-900 dark:text-white placeholder-gray-400 text-center
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200
                ${errors.securityCode ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
              disabled={isLoading}
              autoComplete="cc-csc"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
      {errors.expirationMonth && (
        <p className="text-sm text-red-500">{errors.expirationMonth}</p>
      )}
      {errors.securityCode && (
        <p className="text-sm text-red-500">{errors.securityCode}</p>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-sm text-green-700 dark:text-green-300">
          ข้อมูลบัตรของคุณได้รับการเข้ารหัสและปลอดภัย
        </span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 
          hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl
          shadow-lg shadow-blue-500/25 transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            กำลังดำเนินการ...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            ชำระเงิน ฿{amount.toLocaleString()}
          </span>
        )}
      </Button>
    </form>
  );
}

export default CreditCardForm;
