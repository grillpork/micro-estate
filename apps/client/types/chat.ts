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

  // Online Status
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USERS_STATUS: "users:status",

  // Errors
  ERROR: "error",
} as const;

export type WSMessageType =
  (typeof WS_MESSAGE_TYPES)[keyof typeof WS_MESSAGE_TYPES];

export interface WSMessage {
  type: string;
  payload: any;
}
