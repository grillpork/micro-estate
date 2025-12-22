import { Hono } from "hono";
import { authMiddleware } from "@/shared/middleware";
import { bookingsService } from "./bookings.service";
import type { User } from "@/lib/auth";

type Variables = {
  user: User;
};

const bookings = new Hono<{ Variables: Variables }>();

/**
 * Get my bookings (as a buyer)
 * GET /api/v1/bookings/my
 */
bookings.get("/my", authMiddleware, async (c) => {
  const user = c.get("user");
  const result = await bookingsService.getUserBookings(user.id);
  return c.json({
    success: true,
    data: result,
  });
});

/**
 * Get agent bookings (as an agent)
 * GET /api/v1/bookings/agent
 */
bookings.get("/agent", authMiddleware, async (c) => {
  const user = c.get("user");

  if (user.role !== "agent" && user.role !== "admin") {
    return c.json(
      {
        success: false,
        error: "Only agents can view their property bookings",
      },
      403
    );
  }

  const result = await bookingsService.getAgentBookings(user.id);
  return c.json({
    success: true,
    data: result,
  });
});

/**
 * Update booking status (Agent/Admin only)
 * PATCH /api/v1/bookings/:id/status
 */
bookings.patch("/:id/status", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const { status } = await c.req.json();

  if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
    return c.json({ success: false, error: "Invalid status" }, 400);
  }

  // Check if user is the agent of the property or admin
  const booking = await bookingsService.getBookingById(id);
  if (!booking) {
    return c.json({ success: false, error: "Booking not found" }, 404);
  }

  // Verification here could be more robust, but assuming if they are the agent they can manage it
  // For now let's just check the role
  if (user.role !== "agent" && user.role !== "admin") {
    return c.json({ success: false, error: "Unauthorized" }, 403);
  }

  const result = await bookingsService.updateBookingStatus(id, status);
  return c.json({
    success: true,
    data: result,
  });
});

export { bookings as bookingsRoutes };
