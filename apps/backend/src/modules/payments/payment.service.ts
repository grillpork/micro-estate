import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  transactions,
  bookings,
  featuredListings,
  properties,
} from "@/db/schema";
import {
  createCardCharge,
  createPromptPayCharge,
  getCharge,
  createRefund as omiseRefund,
} from "@/lib/omise";

// ===== Types =====
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

export interface CreatePaymentInput {
  userId: string;
  type: TransactionType;
  amount: number; // in THB (will convert to satang)
  paymentMethod: PaymentMethod;
  propertyId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  returnUri?: string;
  // For card payments
  cardToken?: string;
  // For featured listings
  featuredDays?: number;
}

export interface PaymentResult {
  transaction: typeof transactions.$inferSelect;
  chargeId: string;
  qrCodeUrl?: string; // For PromptPay
  authorizeUri?: string; // For 3D Secure cards
}

// ===== Payment Service =====

/**
 * Create a new payment
 */
export async function createPayment(
  input: CreatePaymentInput
): Promise<PaymentResult> {
  const transactionId = nanoid();
  const amountInSatang = Math.round(input.amount * 100); // Convert THB to satang

  // Create transaction record first
  const [transaction] = await db
    .insert(transactions)
    .values({
      id: transactionId,
      userId: input.userId,
      propertyId: input.propertyId,
      type: input.type,
      amount: input.amount.toString(),
      currency: "THB",
      paymentMethod: input.paymentMethod,
      status: "pending",
      metadata: {
        description: input.description,
        featuredDays: input.featuredDays,
        ...input.metadata,
      },
    })
    .returning();

  try {
    let chargeResult: {
      chargeId: string;
      qrCodeUrl?: string;
      authorizeUri?: string;
      status: string;
    };

    if (input.paymentMethod === "credit_card") {
      if (!input.cardToken) {
        throw new Error("Card token is required for credit card payments");
      }

      const charge = await createCardCharge({
        amount: amountInSatang,
        cardToken: input.cardToken,
        description: input.description || `Payment for ${input.type}`,
        metadata: {
          transactionId,
          userId: input.userId,
          type: input.type,
        },
        returnUri: input.returnUri,
      });

      chargeResult = {
        chargeId: charge.id,
        authorizeUri: charge.authorize_uri || undefined,
        status: charge.status,
      };
    } else {
      // PromptPay
      const result = await createPromptPayCharge({
        amount: amountInSatang,
        description: input.description || `Payment for ${input.type}`,
        metadata: {
          transactionId,
          userId: input.userId,
          type: input.type,
        },
        returnUri: input.returnUri,
      });

      chargeResult = {
        chargeId: result.charge.id,
        qrCodeUrl: result.qrCodeUrl,
        status: result.charge.status,
      };
    }

    // Update transaction with charge ID
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        omiseChargeId: chargeResult.chargeId,
        qrCodeUrl: chargeResult.qrCodeUrl,
        status:
          chargeResult.status === "successful" ? "successful" : "processing",
        paidAt: chargeResult.status === "successful" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId))
      .returning();

    // If successful immediately (e.g. non-3DS card), create related records
    if (updatedTransaction.status === "successful") {
      await createRelatedRecords(updatedTransaction);
    }

    return {
      transaction: updatedTransaction,
      chargeId: chargeResult.chargeId,
      qrCodeUrl: chargeResult.qrCodeUrl,
      authorizeUri: chargeResult.authorizeUri,
    };
  } catch (error) {
    // Update transaction as failed
    await db
      .update(transactions)
      .set({
        status: "failed",
        failureMessage:
          error instanceof Error ? error.message : "Unknown error",
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId));

    throw error;
  }
}

/**
 * Handle webhook event from Omise
 */
export async function handleChargeComplete(chargeId: string) {
  // Get the charge from Omise to verify
  const charge = await getCharge(chargeId);

  // Find the transaction
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.omiseChargeId, chargeId))
    .limit(1);

  if (!transaction) {
    console.error(`Transaction not found for charge: ${chargeId}`);
    return null;
  }

  // Update transaction status based on charge status
  let newStatus: TransactionStatus;
  let failureCode: string | null = null;
  let failureMessage: string | null = null;
  let paidAt: Date | null = null;

  if (charge.status === "successful") {
    newStatus = "successful";
    paidAt = new Date();
  } else if (charge.status === "failed") {
    newStatus = "failed";
    failureCode = charge.failure_code || null;
    failureMessage = charge.failure_message || null;
  } else if (charge.status === "expired") {
    newStatus = "expired";
  } else {
    // Still processing
    return transaction;
  }

  // Update transaction
  const [updatedTransaction] = await db
    .update(transactions)
    .set({
      status: newStatus,
      failureCode,
      failureMessage,
      paidAt,
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, transaction.id))
    .returning();

  // If successful, create related records
  if (newStatus === "successful") {
    await createRelatedRecords(updatedTransaction);
  }

  return updatedTransaction;
}

/**
 * Create related records after successful payment
 */
async function createRelatedRecords(
  transaction: typeof transactions.$inferSelect
) {
  if (transaction.type === "booking_deposit" && transaction.propertyId) {
    // Create booking record
    await db.insert(bookings).values({
      id: nanoid(),
      userId: transaction.userId,
      propertyId: transaction.propertyId,
      transactionId: transaction.id,
      status: "confirmed",
      depositAmount: transaction.amount,
      confirmedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  } else if (
    transaction.type === "featured_listing" &&
    transaction.propertyId
  ) {
    // Create featured listing record
    const metadata = transaction.metadata as { featuredDays?: number } | null;
    const featuredDays = metadata?.featuredDays || 7;
    const now = new Date();
    const endsAt = new Date(now.getTime() + featuredDays * 24 * 60 * 60 * 1000);

    await db.insert(featuredListings).values({
      id: nanoid(),
      propertyId: transaction.propertyId,
      transactionId: transaction.id,
      startsAt: now,
      endsAt,
      isActive: "active",
    });

    // Update property as featured
    await db
      .update(properties)
      .set({ isFeatured: true, updatedAt: new Date() })
      .where(eq(properties.id, transaction.propertyId));
  }
}

/**
 * Get user's transactions
 */
export async function getUserTransactions(userId: string, limit = 20) {
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string) {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);

  return transaction || null;
}

/**
 * Refund a transaction
 */
export async function refundTransaction(
  transactionId: string,
  amount?: number
) {
  const transaction = await getTransactionById(transactionId);

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.status !== "successful") {
    throw new Error("Can only refund successful transactions");
  }

  if (!transaction.omiseChargeId) {
    throw new Error("No charge ID found for transaction");
  }

  const amountInSatang = amount ? Math.round(amount * 100) : undefined;
  await omiseRefund(transaction.omiseChargeId, amountInSatang);

  const [updatedTransaction] = await db
    .update(transactions)
    .set({
      status: amount ? "partially_refunded" : "refunded",
      refundedAmount: (amount || parseFloat(transaction.amount)).toString(),
      refundedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, transactionId))
    .returning();

  return updatedTransaction;
}
