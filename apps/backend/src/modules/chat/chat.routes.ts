import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { success } from "../../shared/utils";
import { authMiddleware } from "../../shared/middleware";
import type { AppEnv } from "../../shared/types";
import * as service from "./chat.service";
import {
  sendMessageSchema,
  markReadSchema,
  getMessagesSchema,
} from "./chat.schema";

export const chatRoutes = new Hono<AppEnv>();

// All routes require authentication
chatRoutes.use("/*", authMiddleware);

// Get conversations list
chatRoutes.get("/conversations", async (c) => {
  const user = c.get("user");
  const conversations = await service.getConversations(user.id);
  return success(c, conversations);
});

// Get messages with a partner
chatRoutes.get(
  "/messages",
  zValidator("query", getMessagesSchema),
  async (c) => {
    const user = c.get("user");
    const query = c.req.valid("query");
    const messages = await service.getMessages(user.id, query);
    return success(c, messages);
  }
);

// Send message
chatRoutes.post(
  "/messages",
  zValidator("json", sendMessageSchema),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");
    const message = await service.sendMessage(user.id, body);
    return success(c, message, 201);
  }
);

// Mark messages as read
chatRoutes.post(
  "/messages/read",
  zValidator("json", markReadSchema),
  async (c) => {
    const user = c.get("user");
    const { messageIds } = c.req.valid("json");
    await service.markMessagesAsRead(user.id, messageIds);
    return success(c, { marked: messageIds.length });
  }
);

// Mark conversation as read (by partnerId)
chatRoutes.post("/conversations/:partnerId/read", async (c) => {
  const user = c.get("user");
  const partnerId = c.req.param("partnerId");
  const marked = await service.markConversationAsRead(user.id, partnerId);
  return success(c, { marked });
});

// Get unread count
chatRoutes.get("/unread-count", async (c) => {
  const user = c.get("user");
  const count = await service.getUnreadCount(user.id);
  return success(c, { count });
});

// AI Chat - proxies to RAG service
chatRoutes.post("/ai", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{
    message: string;
    conversationHistory?: { role: string; content: string }[];
  }>();

  try {
    const { env } = await import("../../config/env");
    console.log(
      `[ChatRoute] Sending request to RAG: ${env.RAG_SERVICE_URL}/api/demands/chat`
    );

    const startTime = Date.now();
    const response = await fetch(`${env.RAG_SERVICE_URL}/api/demands/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        message: body.message,
        conversationHistory: body.conversationHistory || [],
      }),
    });
    console.log(
      `[ChatRoute] RAG Responded in ${Date.now() - startTime}ms with status ${response.status}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ChatRoute] RAG Error Body: ${errorText}`);
      throw new Error(`RAG service responded with ${response.status}`);
    }

    const ragResponse = await response.json();
    console.log(
      `[ChatRoute] RAG Response Data:`,
      JSON.stringify(ragResponse).substring(0, 100) + "..."
    );
    return success(c, ragResponse.data);
  } catch (error) {
    console.error("RAG service error:", error);
    // Return a fallback response instead of throwing
    return success(c, {
      reply:
        "ขออภัยค่ะ ระบบ AI ไม่สามารถใช้งานได้ในขณะนี้ กรุณาลองใหม่ภายหลัง หรือติดต่อตัวแทนโดยตรง",
      suggestAgent: true,
    });
  }
});
