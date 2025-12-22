import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { success } from "../../shared/utils";
import { idParamSchema } from "../../shared/schemas";
import { authMiddleware } from "../../shared/middleware";
import type { AppEnv } from "../../shared/types";
import * as service from "./notifications.service";
import { markNotificationsReadSchema } from "./notifications.schema";

export const notificationsRoutes = new Hono<AppEnv>();

// All routes require authentication
notificationsRoutes.use("/*", authMiddleware);

// Get notifications
notificationsRoutes.get(
  "/",
  zValidator(
    "query",
    z.object({
      limit: z.coerce.number().int().min(1).max(50).default(20),
      cursor: z.string().uuid().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    const query = c.req.valid("query");
    const result = await service.getUserNotifications(user.id, query);
    return success(c, result);
  }
);

// Get unread count
notificationsRoutes.get("/unread-count", async (c) => {
  const user = c.get("user");
  const count = await service.getUnreadNotificationCount(user.id);
  return success(c, { count });
});

// Mark notifications as read
notificationsRoutes.post(
  "/read",
  zValidator("json", markNotificationsReadSchema),
  async (c) => {
    const user = c.get("user");
    const { notificationIds } = c.req.valid("json");
    await service.markNotificationsAsRead(user.id, notificationIds);
    return success(c, { marked: notificationIds.length });
  }
);

// Mark all as read
notificationsRoutes.post("/read-all", async (c) => {
  const user = c.get("user");
  await service.markAllNotificationsAsRead(user.id);
  return success(c, { success: true });
});

// Delete notification
notificationsRoutes.delete(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    await service.deleteNotification(user.id, id);
    return success(c, { deleted: true });
  }
);
