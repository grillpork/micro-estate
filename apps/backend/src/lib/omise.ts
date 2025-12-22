import Omise from "omise";
import { env } from "../config/env";

// Initialize Omise client
export const omise = Omise({
  publicKey: env.OMISE_PUBLIC_KEY,
  secretKey: env.OMISE_SECRET_KEY,
});

// ===== Helper Types =====
export type ChargeStatus =
  | "pending"
  | "successful"
  | "failed"
  | "expired"
  | "reversed";

export interface CreateChargeInput {
  amount: number; // in satang (THB cents)
  currency?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  returnUri?: string;
}

export interface CreateCardChargeInput extends CreateChargeInput {
  cardToken: string;
}

export interface CreatePromptPayChargeInput extends CreateChargeInput {
  // PromptPay doesn't need additional input
}

// ===== Omise Service Functions =====

/**
 * Create a charge with credit/debit card
 */
export async function createCardCharge(input: CreateCardChargeInput) {
  const charge = await omise.charges.create({
    amount: input.amount,
    currency: input.currency || "THB",
    card: input.cardToken,
    description: input.description,
    metadata: input.metadata,
    return_uri: input.returnUri,
  });

  return charge;
}

/**
 * Create a PromptPay source and charge
 */
export async function createPromptPayCharge(input: CreatePromptPayChargeInput) {
  // First create a PromptPay source
  const source = await omise.sources.create({
    type: "promptpay",
    amount: input.amount,
    currency: input.currency || "THB",
  });

  // Then create a charge using the source
  const charge = await omise.charges.create({
    amount: input.amount,
    currency: input.currency || "THB",
    source: source.id,
    description: input.description,
    metadata: input.metadata,
    return_uri: input.returnUri,
  });

  return {
    charge,
    source,
    qrCodeUrl: (
      source as { scannable_code?: { image?: { download_uri?: string } } }
    ).scannable_code?.image?.download_uri,
  };
}

/**
 * Retrieve a charge by ID
 */
export async function getCharge(chargeId: string) {
  return await omise.charges.retrieve(chargeId);
}

/**
 * Create a refund
 */
export async function createRefund(chargeId: string, amount?: number) {
  if (amount !== undefined) {
    return await omise.charges.createRefund(chargeId, { amount });
  }
  // Full refund when no amount specified
  return await omise.charges.createRefund(chargeId, { amount: 0 });
}

/**
 * Verify webhook signature (basic verification)
 * Note: Omise doesn't sign webhooks, but we verify the event exists
 */
export async function verifyWebhookEvent(chargeId: string) {
  try {
    const charge = await getCharge(chargeId);
    return charge;
  } catch {
    return null;
  }
}
