import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db";
import { notifications, users, properties } from "../../db/schema";
import { connectionManager, WS_MESSAGE_TYPES } from "../../lib/websocket";
import type {
  CreateNotificationInput,
  NotificationType,
} from "./notifications.schema";
import { NOTIFICATION_TYPES } from "./notifications.schema";

// ===== Types =====
export interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
}

// ===== Create Notification =====
export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationData> {
  const id = nanoid();

  const [notification] = await db
    .insert(notifications)
    .values({
      id,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body || null,
      data: input.data ? JSON.stringify(input.data) : null,
      isRead: false,
    })
    .returning();

  const notificationData: NotificationData = {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: notification.data ? JSON.parse(notification.data) : null,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  };

  // Send via WebSocket if user is online
  connectionManager.sendToUser(input.userId, {
    type: WS_MESSAGE_TYPES.NOTIFICATION,
    payload: notificationData,
  });

  return notificationData;
}

// ===== Create Favorite Notification =====
export async function createFavoriteNotification(
  propertyId: string,
  favoredByUserId: string
): Promise<void> {
  // Get property and owner
  const [property] = await db
    .select({
      id: properties.id,
      title: properties.title,
      userId: properties.userId,
    })
    .from(properties)
    .where(eq(properties.id, propertyId));

  if (!property || property.userId === favoredByUserId) return;

  // Get user who favorited
  const [favoredBy] = await db
    .select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, favoredByUserId));

  if (!favoredBy) return;

  await createNotification({
    userId: property.userId,
    type: NOTIFICATION_TYPES.FAVORITE,
    title: "New Favorite!",
    body: `${favoredBy.name || "Someone"} added "${property.title}" to favorites`,
    data: {
      propertyId: property.id,
      propertyTitle: property.title,
      userId: favoredBy.id,
      userName: favoredBy.name,
      userImage: favoredBy.image,
    },
  });
}

// ===== Get User Notifications =====
export async function getUserNotifications(
  userId: string,
  options: { limit?: number; cursor?: string } = {}
): Promise<{ notifications: NotificationData[]; hasMore: boolean }> {
  const { limit = 20, cursor } = options;

  let query = db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit + 1);

  if (cursor) {
    const [cursorNotification] = await db
      .select({ createdAt: notifications.createdAt })
      .from(notifications)
      .where(eq(notifications.id, cursor));

    if (cursorNotification) {
      query = db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            sql`${notifications.createdAt} < ${cursorNotification.createdAt}`
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(limit + 1);
    }
  }

  const results = await query;
  const hasMore = results.length > limit;
  const notificationsData = results.slice(0, limit).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    data: n.data ? JSON.parse(n.data) : null,
    isRead: n.isRead,
    createdAt: n.createdAt,
  }));

  return { notifications: notificationsData, hasMore };
}

// ===== Mark Notifications as Read =====
export async function markNotificationsAsRead(
  userId: string,
  notificationIds: string[]
): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, userId),
        inArray(notifications.id, notificationIds)
      )
    );
}

// ===== Mark All as Read =====
export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
}

// ===== Get Unread Count =====
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );

  return Number(count);
}

// ===== Delete Notification =====
export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    );
}
