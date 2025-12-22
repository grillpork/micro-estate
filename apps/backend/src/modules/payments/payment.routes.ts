import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, adminOnly } from "@/shared/middleware";
import type { User } from "@/lib/auth";
import {
  createPayment,
  getUserTransactions,
  getTransactionById,
  refundTransaction,
} from "./payment.service";

// Define context variables type
type Variables = {
  user: User;
};

const payments = new Hono<{ Variables: Variables }>();

// ===== Validation Schemas =====
const createPaymentSchema = z.object({
  type: z.enum(["booking_deposit", "agent_fee", "featured_listing"]),
  amount: z.number().positive(),
  paymentMethod: z.enum(["credit_card", "promptpay"]),
  propertyId: z.string().optional(),
  description: z.string().optional(),
  cardToken: z.string().optional(),
  featuredDays: z.number().min(1).max(90).optional(),
  returnUri: z.string().url().optional(),
});

// ===== Routes =====

/**
 * Create a new payment
 * POST /api/v1/payments
 */
payments.post(
  "/",
  authMiddleware,
  zValidator("json", createPaymentSchema),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");

    // Validate card token for credit card payments
    if (body.paymentMethod === "credit_card" && !body.cardToken) {
      return c.json(
        {
          success: false,
          error: "Card token is required for credit card payments",
          code: "CARD_TOKEN_REQUIRED",
        },
        400
      );
    }

    // Validate propertyId for booking deposits and featured listings
    if (
      (body.type === "booking_deposit" || body.type === "featured_listing") &&
      !body.propertyId
    ) {
      return c.json(
        {
          success: false,
          error: "Property ID is required for this transaction type",
          code: "PROPERTY_ID_REQUIRED",
        },
        400
      );
    }

    try {
      const result = await createPayment({
        userId: user.id,
        type: body.type,
        amount: body.amount,
        paymentMethod: body.paymentMethod,
        propertyId: body.propertyId,
        description: body.description,
        cardToken: body.cardToken,
        featuredDays: body.featuredDays,
        returnUri: body.returnUri,
      });

      return c.json({
        success: true,
        data: {
          transaction: result.transaction,
          chargeId: result.chargeId,
          qrCodeUrl: result.qrCodeUrl,
          authorizeUri: result.authorizeUri,
        },
      });
    } catch (error) {
      console.error("Payment creation failed:", error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Payment failed",
          code: "PAYMENT_FAILED",
        },
        500
      );
    }
  }
);

/**
 * Get user's transactions
 * GET /api/v1/payments
 */
payments.get("/", authMiddleware, async (c) => {
  const user = c.get("user");
  const limit = parseInt(c.req.query("limit") || "20");

  const userTransactions = await getUserTransactions(user.id, limit);

  return c.json({
    success: true,
    data: userTransactions,
  });
});

/**
 * Get transaction by ID
 * GET /api/v1/payments/:id
 */
payments.get("/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const transactionId = c.req.param("id");

  const transaction = await getTransactionById(transactionId);

  if (!transaction) {
    return c.json(
      {
        success: false,
        error: "Transaction not found",
        code: "NOT_FOUND",
      },
      404
    );
  }

  // Check ownership
  if (transaction.userId !== user.id && user.role !== "admin") {
    return c.json(
      {
        success: false,
        error: "Unauthorized",
        code: "FORBIDDEN",
      },
      403
    );
  }

  return c.json({
    success: true,
    data: transaction,
  });
});

/**
 * Refund a transaction (Admin only)
 * POST /api/v1/payments/:id/refund
 */
payments.post(
  "/:id/refund",
  authMiddleware,
  adminOnly,
  zValidator("json", z.object({ amount: z.number().positive().optional() })),
  async (c) => {
    const transactionId = c.req.param("id");
    const { amount } = c.req.valid("json");

    try {
      const transaction = await refundTransaction(transactionId, amount);

      return c.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Refund failed",
          code: "REFUND_FAILED",
        },
        400
      );
    }
  }
);

export { payments as paymentRoutes };
