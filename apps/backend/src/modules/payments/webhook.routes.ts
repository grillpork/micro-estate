import { Hono } from "hono";
import { handleChargeComplete } from "./payment.service";

const webhooks = new Hono();

// ===== Omise Webhook Types =====
interface OmiseWebhookEvent {
  object: "event";
  id: string;
  livemode: boolean;
  location: string;
  key: string;
  created_at: string;
  data: {
    object: string;
    id: string;
    status: string;
    [key: string]: unknown;
  };
}

/**
 * Omise Webhook Handler
 * POST /api/v1/webhooks/omise
 *
 * This endpoint receives webhook events from Omise.
 * Important: This should NOT have rate limiting or authentication.
 */
webhooks.post("/omise", async (c) => {
  try {
    const event = (await c.req.json()) as OmiseWebhookEvent;

    console.log(`[Webhook] Received event: ${event.key}`, {
      id: event.id,
      chargeId: event.data?.id,
    });

    // Handle different event types
    switch (event.key) {
      case "charge.complete": {
        const chargeId = event.data.id;
        const transaction = await handleChargeComplete(chargeId);

        if (transaction) {
          console.log(
            `[Webhook] Charge complete processed: ${chargeId}, status: ${transaction.status}`
          );
        }
        break;
      }

      case "charge.create": {
        // Optional: Log charge creation
        console.log(`[Webhook] Charge created: ${event.data.id}`);
        break;
      }

      case "refund.create": {
        // Optional: Handle refund confirmation
        console.log(`[Webhook] Refund created for charge: ${event.data.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.key}`);
    }

    // Always respond with 200 to acknowledge receipt
    return c.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);

    // Still return 200 to prevent Omise from retrying
    // Log the error for investigation
    return c.json({ received: true, error: "Processing error logged" });
  }
});

/**
 * Webhook health check
 * GET /api/v1/webhooks/omise
 */
webhooks.get("/omise", (c) => {
  return c.json({
    status: "ok",
    message: "Omise webhook endpoint is ready",
    timestamp: new Date().toISOString(),
  });
});

export { webhooks as webhookRoutes };
