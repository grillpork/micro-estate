import type { ServerWebSocket } from "bun";
import {
  connectionManager,
  WS_MESSAGE_TYPES,
  type WebSocketData,
  type WebSocketMessage,
} from "../../lib/websocket";
import { auth } from "../../lib/auth";
import * as chatService from "../chat/chat.service";
import {
  sendMessageSchema,
  markReadSchema,
  typingSchema,
} from "../chat/chat.schema";
import { markNotificationsAsRead } from "../notifications/notifications.service";

// ===== Message Handlers =====
type MessageHandler = (
  ws: ServerWebSocket<WebSocketData>,
  payload: unknown
) => Promise<void> | void;

const messageHandlers: Record<string, MessageHandler> = {
  // Ping/Pong for connection keep-alive
  [WS_MESSAGE_TYPES.PING]: (ws) => {
    ws.send(JSON.stringify({ type: WS_MESSAGE_TYPES.PONG }));
  },

  // Send chat message
  [WS_MESSAGE_TYPES.CHAT_MESSAGE]: async (ws, payload) => {
    const result = sendMessageSchema.safeParse(payload);
    if (!result.success) {
      ws.send(
        JSON.stringify({
          type: WS_MESSAGE_TYPES.ERROR,
          payload: {
            message: "Invalid message format",
            errors: result.error.issues,
          },
        })
      );
      return;
    }

    await chatService.sendMessage(ws.data.userId, result.data);
  },

  // Typing indicator
  [WS_MESSAGE_TYPES.CHAT_TYPING]: (ws, payload) => {
    const result = typingSchema.safeParse(payload);
    if (result.success) {
      chatService.sendTypingIndicator(
        ws.data.userId,
        ws.data.userName,
        result.data.receiverId,
        true
      );
    }
  },

  // Stop typing indicator
  [WS_MESSAGE_TYPES.CHAT_STOP_TYPING]: (ws, payload) => {
    const result = typingSchema.safeParse(payload);
    if (result.success) {
      chatService.sendTypingIndicator(
        ws.data.userId,
        ws.data.userName,
        result.data.receiverId,
        false
      );
    }
  },

  // Mark messages as read
  [WS_MESSAGE_TYPES.CHAT_READ]: async (ws, payload) => {
    const result = markReadSchema.safeParse(payload);
    if (result.success) {
      await chatService.markMessagesAsRead(
        ws.data.userId,
        result.data.messageIds
      );
    }
  },

  // Mark notifications as read
  [WS_MESSAGE_TYPES.NOTIFICATION_READ]: async (ws, payload) => {
    const parsed = payload as { notificationIds?: string[] };
    if (parsed.notificationIds?.length) {
      await markNotificationsAsRead(ws.data.userId, parsed.notificationIds);
    }
  },

  // Get users online status
  [WS_MESSAGE_TYPES.USERS_STATUS]: async (ws, payload) => {
    const parsed = payload as { userIds?: string[] };
    if (parsed.userIds?.length) {
      const statuses = await connectionManager.getOnlineStatuses(
        parsed.userIds
      );
      ws.send(
        JSON.stringify({
          type: WS_MESSAGE_TYPES.USERS_STATUS,
          payload: Object.fromEntries(statuses),
        })
      );
    }
  },
};

// ===== WebSocket Handlers =====
export const wsHandlers = {
  /**
   * Handle new WebSocket connection
   */
  async open(ws: ServerWebSocket<WebSocketData>) {
    const { userId, userName } = ws.data;

    // Add to connection manager
    connectionManager.addConnection(userId, ws);

    // Send connected confirmation
    ws.send(
      JSON.stringify({
        type: WS_MESSAGE_TYPES.CONNECTED,
        payload: { userId, userName },
      })
    );

    // Broadcast user online status
    connectionManager.broadcast(
      {
        type: WS_MESSAGE_TYPES.USER_ONLINE,
        payload: { userId, userName },
      },
      userId
    );

    console.log(`[WS] User connected: ${userName} (${userId})`);
  },

  /**
   * Handle incoming WebSocket message
   */
  async message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
    try {
      const data: WebSocketMessage = JSON.parse(
        typeof message === "string" ? message : message.toString()
      );

      const handler = messageHandlers[data.type];
      if (handler) {
        await handler(ws, data.payload);
      } else {
        console.warn(`[WS] Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error("[WS] Error processing message:", error);
      ws.send(
        JSON.stringify({
          type: WS_MESSAGE_TYPES.ERROR,
          payload: { message: "Invalid message format" },
        })
      );
    }
  },

  /**
   * Handle WebSocket close
   */
  close(ws: ServerWebSocket<WebSocketData>) {
    const { userId, userName } = ws.data;

    // Remove from connection manager
    connectionManager.removeConnection(userId, ws);

    // Broadcast user offline status (only if no more connections)
    if (!connectionManager.isConnected(userId)) {
      connectionManager.broadcast({
        type: WS_MESSAGE_TYPES.USER_OFFLINE,
        payload: { userId, userName, lastSeen: Date.now() },
      });
    }

    console.log(`[WS] User disconnected: ${userName} (${userId})`);
  },

  /**
   * Handle WebSocket error
   */
  error(ws: ServerWebSocket<WebSocketData>, error: Error) {
    console.error(`[WS] Error for user ${ws.data.userId}:`, error);
  },
};

// ===== Authenticate WebSocket Connection =====
export async function authenticateWebSocket(
  request: Request
): Promise<WebSocketData | null> {
  try {
    // Get session from auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return null;
    }

    return {
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      userImage: session.user.image || null,
    };
  } catch (error) {
    console.error("[WS] Auth error:", error);
    return null;
  }
}
