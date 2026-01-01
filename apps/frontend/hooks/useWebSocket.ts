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

<<<<<<< HEAD
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
=======
  // Use refs for callbacks to avoid re-creating connect function
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onMessage, onConnect, onDisconnect, onError]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Use selectors to avoid subscribing to the entire store state
  const addMessage = useChatStore((state) => state.addMessage);
  const markAsRead = useChatStore((state) => state.markAsRead);
>>>>>>> 3f33e72 (feat: Add new UI components, chat features, and services, while updating admin layout, backend user service, and frontend pages.)

  const connect = useCallback(() => {
    setIsConnecting(true);
<<<<<<< HEAD
    wsManager.connect();
  }, []);
=======
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        if (onConnectRef.current) onConnectRef.current();
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        if (onDisconnectRef.current) onDisconnectRef.current();

        // Auto reconnect
        if (
          autoReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          // Exponential backoff: min(base * 2^attempts, 30s)
          const delay = Math.min(
            reconnectInterval * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        setIsConnecting(false);
        if (onErrorRef.current) onErrorRef.current(error);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;

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

          // Call custom handler
          if (onMessageRef.current) onMessageRef.current(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
    } catch (error) {
      setIsConnecting(false);
      console.error("Failed to connect WebSocket:", error);
    }
  }, [
    autoReconnect,
    reconnectInterval,
    maxReconnectAttempts,
    addMessage,
    markAsRead,
  ]);
>>>>>>> 3f33e72 (feat: Add new UI components, chat features, and services, while updating admin layout, backend user service, and frontend pages.)

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
