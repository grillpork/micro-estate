"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreditCard, Lock, Loader2, CheckCircle } from "lucide-react";
import { PatternFormat } from "react-number-format";
import { createCardToken, getCardBrand } from "@/lib/omise";
import { Button } from "@/components/ui/button";

const cardSchema = z.object({
  number: z
    .string()
    .min(16, "หมายเลขบัตรต้องมี 16 หลัก")
    .transform((val) => val.replace(/\s/g, "")),
  name: z.string().min(1, "กรุณากรอกชื่อบนบัตร"),
  expirationMonth: z.string().min(1, "กรุณาเลือกเดือน"),
  expirationYear: z.string().min(1, "กรุณาเลือกปี"),
  securityCode: z.string().regex(/^\d{3,4}$/, "CVV ไม่ถูกต้อง"),
});

type CardFormValues = z.infer<typeof cardSchema>;

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
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [cardBrand, setCardBrand] = useState("unknown");

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      number: "",
      name: "",
      expirationMonth: "",
      expirationYear: "",
      securityCode: "",
    },
  });

  const onSubmit = async (data: CardFormValues) => {
    setIsCreatingToken(true);
    try {
      const token = await createCardToken(data);
      onTokenCreated(token);
    } catch (error) {
      setError("number", {
        type: "manual",
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถสร้าง token ได้ กรุณาลองใหม่",
      });
    } finally {
      setIsCreatingToken(false);
    }
  };

  const isLoading = isCreatingToken || isProcessing;

  const cardBrandIcon = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    jcb: "💳",
    unionpay: "💳",
    unknown: "",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Card Number */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          หมายเลขบัตร
        </label>
        <div className="relative">
          <Controller
            control={control}
            name="number"
            render={({ field: { onChange, value, ...field } }) => (
              <PatternFormat
                {...field}
                format="#### #### #### ####"
                value={value}
                onValueChange={(values) => {
                  onChange(values.value);
                  setCardBrand(getCardBrand(values.value));
                }}
                placeholder="0000 0000 0000 0000"
                className={`w-full px-4 py-3 pr-12 border rounded-xl bg-white dark:bg-gray-800 
                  text-gray-900 dark:text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200
                  ${errors.number ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                disabled={isLoading}
                autoComplete="cc-number"
              />
            )}
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
          <p className="text-sm text-red-500">{errors.number.message}</p>
        )}
      </div>

      {/* Cardholder Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ชื่อบนบัตร
        </label>
        <input
          type="text"
          {...register("name")}
          placeholder="JOHN DOE"
          className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 
            text-gray-900 dark:text-white placeholder-gray-400 uppercase
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
          disabled={isLoading}
          autoComplete="cc-name"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Expiry & CVV */}
      <div className="grid grid-cols-3 gap-4">
        {/* Month */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            เดือน
          </label>
          <select
            {...register("expirationMonth")}
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
            {...register("expirationYear")}
            className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${errors.expirationYear ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
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
            <Controller
              control={control}
              name="securityCode"
              render={({ field }) => (
                <PatternFormat
                  {...field}
                  format="####"
                  placeholder="•••"
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-white placeholder-gray-400 text-center
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                    ${errors.securityCode ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  disabled={isLoading}
                  autoComplete="cc-csc"
                  type="password"
                />
              )}
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
      {(errors.expirationMonth || errors.expirationYear) && (
        <p className="text-sm text-red-500">กรุณาระบุวันหมดอายุให้ครบถ้วน</p>
      )}
      {errors.securityCode && (
        <p className="text-sm text-red-500">{errors.securityCode.message}</p>
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
