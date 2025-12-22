import { eq, desc, and } from "drizzle-orm";
import { db } from "@/db";
import { bookings, properties, transactions, users } from "@/db/schema";

export const bookingsService = {
  /**
   * Get bookings for a user (as a buyer)
   */
  getUserBookings: async (userId: string) => {
    return await db
      .select({
        id: bookings.id,
        status: bookings.status,
        depositAmount: bookings.depositAmount,
        confirmedAt: bookings.confirmedAt,
        expiresAt: bookings.expiresAt,
        createdAt: bookings.createdAt,
        property: {
          id: properties.id,
          title: properties.title,
          price: properties.price,
          thumbnailUrl: properties.thumbnailUrl,
        },
        transaction: {
          id: transactions.id,
          status: transactions.status,
          paymentMethod: transactions.paymentMethod,
        },
      })
      .from(bookings)
      .innerJoin(properties, eq(bookings.propertyId, properties.id))
      .innerJoin(transactions, eq(bookings.transactionId, transactions.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  },

  /**
   * Get bookings for an agent's properties
   */
  getAgentBookings: async (agentId: string) => {
    return await db
      .select({
        id: bookings.id,
        status: bookings.status,
        depositAmount: bookings.depositAmount,
        confirmedAt: bookings.confirmedAt,
        expiresAt: bookings.expiresAt,
        createdAt: bookings.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
        property: {
          id: properties.id,
          title: properties.title,
          price: properties.price,
          thumbnailUrl: properties.thumbnailUrl,
        },
      })
      .from(bookings)
      .innerJoin(properties, eq(bookings.propertyId, properties.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(eq(properties.userId, agentId))
      .orderBy(desc(bookings.createdAt));
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (id: string) => {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);
    return booking || null;
  },

  /**
   * Update booking status
   */
  updateBookingStatus: async (
    id: string,
    status: "pending" | "confirmed" | "cancelled" | "completed"
  ) => {
    const [updated] = await db
      .update(bookings)
      .set({
        status,
        updatedAt: new Date(),
        ...(status === "confirmed" ? { confirmedAt: new Date() } : {}),
        ...(status === "cancelled" ? { cancelledAt: new Date() } : {}),
      })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  },
};
