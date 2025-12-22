/**
 * Payment Types
 * Types for Omise payment integration
 */

// ===== Transaction Types =====
export type TransactionType =
  | "booking_deposit"
  | "agent_fee"
  | "featured_listing";
export type PaymentMethod = "credit_card" | "promptpay";
export type TransactionStatus =
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "expired"
  | "refunded"
  | "partially_refunded";

// ===== Transaction =====
export interface Transaction {
  id: string;
  userId: string;
  propertyId?: string | null;
  type: TransactionType;
  amount: string;
  currency: string;
  paymentMethod?: PaymentMethod | null;
  status: TransactionStatus;
  omiseChargeId?: string | null;
  qrCodeUrl?: string | null;
  metadata?: {
    cardBrand?: string;
    lastDigits?: string;
    description?: string;
    featuredDays?: number;
    [key: string]: unknown;
  } | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  refundedAmount?: string | null;
  refundedAt?: Date | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Payment Request =====
export interface CreatePaymentRequest {
  type: TransactionType;
  amount: number;
  paymentMethod: PaymentMethod;
  propertyId?: string;
  description?: string;
  cardToken?: string;
  featuredDays?: number;
  returnUri?: string;
}

// ===== Payment Response =====
export interface PaymentResponse {
  transaction: Transaction;
  chargeId: string;
  qrCodeUrl?: string; // For PromptPay
  authorizeUri?: string; // For 3D Secure cards
}

// ===== Omise Card Token =====
export interface OmiseTokenSuccess {
  object: "token";
  id: string;
  livemode: boolean;
  used: boolean;
  card: {
    object: "card";
    id: string;
    brand: string;
    last_digits: string;
    name: string;
    expiration_month: number;
    expiration_year: number;
    fingerprint: string;
    security_code_check: boolean;
  };
  created: string;
}

export interface OmiseTokenError {
  object: "error";
  location: string;
  code: string;
  message: string;
}

export type OmiseTokenResponse = OmiseTokenSuccess | OmiseTokenError;

// ===== Card Form Data =====
export interface CardFormData {
  name: string;
  number: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
}

// ===== Payment Modal State =====
export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  amount: number;
  propertyId?: string;
  description?: string;
  featuredDays?: number;
  onSuccess?: (transaction: Transaction) => void;
  onError?: (error: string) => void;
}

// ===== Omise Global Type =====
declare global {
  interface Window {
    Omise: {
      setPublicKey: (key: string) => void;
      createToken: (
        type: "card",
        data: {
          name: string;
          number: string;
          expiration_month: number;
          expiration_year: number;
          security_code: string;
        },
        callback: (statusCode: number, response: OmiseTokenResponse) => void
      ) => void;
    };
    OmiseCard?: {
      configure: (config: OmiseCardConfig) => void;
      open: (config: OmiseCardOpenConfig) => void;
    };
  }
}

// ===== Omise Card.js Config =====
export interface OmiseCardConfig {
  publicKey: string;
  currency?: string;
  frameLabel?: string;
  submitLabel?: string;
  buttonLabel?: string;
}

export interface OmiseCardOpenConfig {
  amount: number;
  currency?: string;
  defaultPaymentMethod?: PaymentMethod;
  otherPaymentMethods?: string[];
  onCreateTokenSuccess?: (token: string) => void;
  onFormClosed?: () => void;
}
