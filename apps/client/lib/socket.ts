import { WSMessage } from "@/types/chat";

class SocketService {
  private socket: WebSocket | null = null;
  private static instance: SocketService;
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(token: string) {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    this.token = token;

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

    // Bun backend needs the token for authentication (it's expecting it in authenticateWebSocket)
    // Looking at the backend (apps/backend/src/modules/websocket/index.ts usually handles this)
    // Often it checks Authorization header or a query param.
    // Since it's a raw upgrade, it usually uses query params or cookies.

    this.socket = new WebSocket(`${WS_URL}?token=${token}`);

    this.socket.onopen = () => {
      console.log("✅ [WS] Connected");
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        console.log(
          `📩 [WS] Received message: ${message.type}`,
          message.payload
        );
        const eventListeners = this.listeners.get(message.type);
        if (eventListeners) {
          eventListeners.forEach((callback) => callback(message.payload));
        }
      } catch (error) {
        console.error("❌ [WS] Failed to parse message", error);
      }
    };

    this.socket.onclose = () => {
      console.log("⚠️ [WS] Disconnected");
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error("❌ [WS] Error", error);
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.token) {
      this.reconnectAttempts++;
      console.log(
        `🔄 [WS] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.connect(this.token!), this.reconnectInterval);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.token = null;
    }
  }

  // Support for specific event types
  public on(type: string, callback: (payload: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  public off(type: string, callback: (payload: any) => void) {
    const eventListeners = this.listeners.get(type);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  public emit(type: string, payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn("⚠️ [WS] Cannot emit, socket not open");
    }
  }

  public getSocket() {
    return this.socket;
  }
}

export const socketService = SocketService.getInstance();
