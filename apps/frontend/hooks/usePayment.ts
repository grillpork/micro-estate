"use client";

/**
 * usePayment Hook
 * Provides a simple interface to open payment modal and handle transactions
 */

import { useState, useCallback } from "react";
import type {
  TransactionType,
  Transaction,
  PaymentModalProps,
} from "@/types/payment";

interface UsePaymentOptions {
  onSuccess?: (transaction: Transaction) => void;
  onError?: (error: string) => void;
}

interface PaymentRequest {
  type: TransactionType;
  amount: number;
  propertyId?: string;
  description?: string;
  featuredDays?: number;
}

interface UsePaymentReturn {
  isOpen: boolean;
  modalProps: PaymentModalProps;
  openPayment: (request: PaymentRequest) => void;
  closePayment: () => void;
}

export function usePayment(options: UsePaymentOptions = {}): UsePaymentReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null
  );

  const openPayment = useCallback((request: PaymentRequest) => {
    setPaymentRequest(request);
    setIsOpen(true);
  }, []);

  const closePayment = useCallback(() => {
    setIsOpen(false);
    setPaymentRequest(null);
  }, []);

  const handleSuccess = useCallback(
    (transaction: Transaction) => {
      options.onSuccess?.(transaction);
    },
    [options]
  );

  const handleError = useCallback(
    (error: string) => {
      options.onError?.(error);
    },
    [options]
  );

  const modalProps: PaymentModalProps = {
    isOpen,
    onClose: closePayment,
    type: paymentRequest?.type ?? "booking_deposit",
    amount: paymentRequest?.amount ?? 0,
    propertyId: paymentRequest?.propertyId,
    description: paymentRequest?.description,
    featuredDays: paymentRequest?.featuredDays,
    onSuccess: handleSuccess,
    onError: handleError,
  };

  return {
    isOpen,
    modalProps,
    openPayment,
    closePayment,
  };
}

export default usePayment;
