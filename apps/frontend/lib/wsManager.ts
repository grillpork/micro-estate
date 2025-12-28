/**
 * WebSocket Manager
 * Singleton for managing WebSocket connection across the app
 */

type MessageHandler = (message: WebSocketMessage) => void;

interface WebSocketMessage {
    type: string;
    payload: unknown;
}

interface WebSocketManagerState {
    ws: WebSocket | null;
    isConnected: boolean;
    isConnecting: boolean;
    handlers: Set<MessageHandler>;
    reconnectAttempts: number;
    reconnectTimeout: NodeJS.Timeout | null;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;

const state: WebSocketManagerState = {
    ws: null,
    isConnected: false,
    isConnecting: false,
    handlers: new Set(),
    reconnectAttempts: 0,
    reconnectTimeout: null,
};

// Listeners for connection state changes
const connectionListeners = new Set<(connected: boolean) => void>();

function notifyConnectionChange(connected: boolean) {
    state.isConnected = connected;
    connectionListeners.forEach((listener) => listener(connected));
}

function handleMessage(event: MessageEvent) {
    try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        state.handlers.forEach((handler) => handler(data));
    } catch (error) {
        console.error("[WS Manager] Failed to parse message:", error);
    }
}

function scheduleReconnect() {
    if (state.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log("[WS Manager] Max reconnect attempts reached");
        return;
    }

    state.reconnectTimeout = setTimeout(() => {
        state.reconnectAttempts++;
        wsManager.connect();
    }, RECONNECT_INTERVAL);
}

export const wsManager = {
    /**
     * Connect to WebSocket server
     */
    connect() {
        // Prevent multiple connections
        if (state.isConnecting) return;
        if (state.ws?.readyState === WebSocket.OPEN) return;
        if (state.ws?.readyState === WebSocket.CONNECTING) return;

        state.isConnecting = true;
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

        try {
            state.ws = new WebSocket(wsUrl);

            state.ws.onopen = () => {
                state.isConnecting = false;
                state.reconnectAttempts = 0;
                notifyConnectionChange(true);
                console.log("[WS Manager] Connected");
            };

            state.ws.onclose = () => {
                state.isConnecting = false;
                notifyConnectionChange(false);
                console.log("[WS Manager] Disconnected");

                // Only reconnect if we had handlers (means app wants connection)
                if (state.handlers.size > 0) {
                    scheduleReconnect();
                }
            };

            state.ws.onerror = (error) => {
                state.isConnecting = false;
                console.error("[WS Manager] Error:", error);
            };

            state.ws.onmessage = handleMessage;
        } catch (error) {
            state.isConnecting = false;
            console.error("[WS Manager] Connection failed:", error);
        }
    },

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (state.reconnectTimeout) {
            clearTimeout(state.reconnectTimeout);
            state.reconnectTimeout = null;
        }
        if (state.ws) {
            state.ws.close();
            state.ws = null;
        }
        state.isConnecting = false;
        state.reconnectAttempts = 0;
        notifyConnectionChange(false);
    },

    /**
     * Send a message through WebSocket
     */
    send(type: string, payload: unknown): boolean {
        if (state.ws?.readyState === WebSocket.OPEN) {
            state.ws.send(JSON.stringify({ type, payload }));
            return true;
        }
        return false;
    },

    /**
     * Add a message handler
     */
    addHandler(handler: MessageHandler) {
        state.handlers.add(handler);
    },

    /**
     * Remove a message handler
     */
    removeHandler(handler: MessageHandler) {
        state.handlers.delete(handler);
    },

    /**
     * Subscribe to connection state changes
     */
    onConnectionChange(listener: (connected: boolean) => void) {
        connectionListeners.add(listener);
        // Immediately call with current state
        listener(state.isConnected);
        return () => connectionListeners.delete(listener);
    },

    /**
     * Get current connection state
     */
    get isConnected() {
        return state.isConnected;
    },

    /**
     * Get current connecting state
     */
    get isConnecting() {
        return state.isConnecting;
    },
};

export type { WebSocketMessage };
