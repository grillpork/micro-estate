import type { ServerWebSocket } from "bun";
import { redis } from "../shared/services/redis";
import { CACHE_TTL } from "../shared/constants";

// ===== Types =====
export interface WebSocketData {
  userId: string;
  userName: string;
  userImage: string | null;
}

export interface WebSocketMessage {
  type: string;
  payload: unknown;
}

// ===== Connection Manager =====
class ConnectionManager {
  private connections: Map<string, Set<ServerWebSocket<WebSocketData>>> =
    new Map();

  /**
   * Add a connection for a user
   */
  addConnection(userId: string, ws: ServerWebSocket<WebSocketData>) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(ws);
    this.setOnlineStatus(userId, true);
  }

  /**
   * Remove a connection for a user
   */
  removeConnection(userId: string, ws: ServerWebSocket<WebSocketData>) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
        this.setOnlineStatus(userId, false);
      }
    }
  }

  /**
   * Get all connections for a user
   */
  getConnections(
    userId: string
  ): Set<ServerWebSocket<WebSocketData>> | undefined {
    return this.connections.get(userId);
  }

  /**
   * Check if user is connected
   */
  isConnected(userId: string): boolean {
    const connections = this.connections.get(userId);
    return connections !== undefined && connections.size > 0;
  }

  /**
   * Get all online user IDs
   */
  getOnlineUserIds(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId: string, message: WebSocketMessage) {
    const connections = this.connections.get(userId);
    if (connections) {
      const data = JSON.stringify(message);
      connections.forEach((ws) => {
        if (ws.readyState === 1) {
          ws.send(data);
        }
      });
    }
  }

  /**
   * Send message to multiple users
   */
  sendToUsers(userIds: string[], message: WebSocketMessage) {
    userIds.forEach((userId) => this.sendToUser(userId, message));
  }

  /**
   * Broadcast message to all connected users
   */
  broadcast(message: WebSocketMessage, excludeUserId?: string) {
    const data = JSON.stringify(message);
    this.connections.forEach((connections, userId) => {
      if (userId !== excludeUserId) {
        connections.forEach((ws) => {
          if (ws.readyState === 1) {
            ws.send(data);
          }
        });
      }
    });
  }

  /**
   * Set online status in Redis
   */
  private async setOnlineStatus(userId: string, online: boolean) {
    if (online) {
      await redis.set(`online:${userId}`, Date.now(), { ex: CACHE_TTL.LONG });
    } else {
      await redis.set(`offline:${userId}`, Date.now(), { ex: CACHE_TTL.DAY });
      await redis.del(`online:${userId}`);
    }
  }

  /**
   * Get user's online status
   */
  async getOnlineStatus(
    userId: string
  ): Promise<{ online: boolean; lastSeen: number | null }> {
    const onlineTime = await redis.get<number>(`online:${userId}`);
    if (onlineTime) {
      return { online: true, lastSeen: onlineTime };
    }

    const offlineTime = await redis.get<number>(`offline:${userId}`);
    return { online: false, lastSeen: offlineTime };
  }

  /**
   * Get multiple users' online status
   */
  async getOnlineStatuses(userIds: string[]): Promise<Map<string, boolean>> {
    const statuses = new Map<string, boolean>();
    for (const userId of userIds) {
      statuses.set(userId, this.isConnected(userId));
    }
    return statuses;
  }
}

// Singleton instance
export const connectionManager = new ConnectionManager();

// ===== Message Types =====
export const WS_MESSAGE_TYPES = {
  // Connection
  CONNECTED: "connected",
  PING: "ping",
  PONG: "pong",

  // Chat
  CHAT_MESSAGE: "chat:message",
  CHAT_TYPING: "chat:typing",
  CHAT_STOP_TYPING: "chat:stop_typing",
  CHAT_READ: "chat:read",
  CHAT_DELIVERED: "chat:delivered",

  // Notifications
  NOTIFICATION: "notification",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_UNREAD_COUNT: "notification:unread_count",

  // Online Status
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USERS_STATUS: "users:status",

  // Errors
  ERROR: "error",
} as const;

export type WSMessageType =
  (typeof WS_MESSAGE_TYPES)[keyof typeof WS_MESSAGE_TYPES];
