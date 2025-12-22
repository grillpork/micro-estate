import { z } from "zod";

export const NOTIFICATION_TYPES = {
  FAVORITE: "favorite",
  MESSAGE: "message",
  PROPERTY_VIEW: "property_view",
  PROPERTY_INQUIRY: "property_inquiry",
  SYSTEM: "system",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.string(),
  title: z.string().min(1).max(200),
  body: z.string().max(500).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const markNotificationsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1).max(100),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
