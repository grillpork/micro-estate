"use client";

import { useEffect, useCallback, useState } from "react";
import { wsManager, type WebSocketMessage } from "@/lib/wsManager";
import { useChatStore, useNotificationStore } from "@/stores";
import type { Message } from "@/types";

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onMessage, onConnect, onDisconnect } = options;

  const [isConnected, setIsConnected] = useState(wsManager.isConnected);
  const [isConnecting, setIsConnecting] = useState(wsManager.isConnecting);

  const { addMessage, markAsRead } = useChatStore();
  const { addNotification, setUnreadCount } = useNotificationStore();

  // Handle messages
  useEffect(() => {
    const handler = (data: WebSocketMessage) => {
      // Handle chat messages
      if (data.type === "chat:message") {
        const payload = data.payload as {
          conversationId: string;
          message: Message;
        };
        addMessage(payload.conversationId, payload.message);
      }

      // Handle read receipts
      if (data.type === "chat:read") {
        const payload = data.payload as { conversationId: string };
        markAsRead(payload.conversationId);
      }

      // Handle new notification
      if (data.type === "notification") {
        const notification = data.payload as {
          id: string;
          type: string;
          title: string;
          body: string | null;
          data: Record<string, unknown> | null;
          isRead: boolean;
          createdAt: string;
        };
        addNotification(notification);
      }

      // Handle unread count update (sent on connection)
      if (data.type === "notification:unread_count") {
        const payload = data.payload as { count: number };
        setUnreadCount(payload.count);
      }

      // Call custom handler
      onMessage?.(data);
    };

    wsManager.addHandler(handler);
    return () => wsManager.removeHandler(handler);
  }, [addMessage, markAsRead, addNotification, setUnreadCount, onMessage]);

  // Subscribe to connection changes
  useEffect(() => {
    const unsubscribe = wsManager.onConnectionChange((connected) => {
      setIsConnected(connected);
      setIsConnecting(false);
      if (connected) {
        onConnect?.();
      } else {
        onDisconnect?.();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [onConnect, onDisconnect]);

  const connect = useCallback(() => {
    setIsConnecting(true);
    wsManager.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
  }, []);

  const send = useCallback((type: string, payload: unknown) => {
    return wsManager.send(type, payload);
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    send,
  };
}
