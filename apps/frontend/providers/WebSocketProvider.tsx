"use client";

import { useEffect, useRef } from "react";
import { wsManager } from "@/lib/wsManager";
import { useWebSocket } from "@/hooks";
import { useIsAuthenticated, useIsHydrated } from "@/stores";

interface WebSocketProviderProps {
    children: React.ReactNode;
}

/**
 * WebSocket Provider
 * Automatically connects WebSocket when user is authenticated
 * Uses singleton wsManager to prevent multiple connections
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const isAuthenticated = useIsAuthenticated();
    const isHydrated = useIsHydrated();
    const hasConnected = useRef(false);

    // Use the hook to register message handlers
    useWebSocket();

    useEffect(() => {
        // Wait for hydration before checking auth
        if (!isHydrated) return;

        if (isAuthenticated && !hasConnected.current) {
            // Connect when authenticated
            wsManager.connect();
            hasConnected.current = true;
        } else if (!isAuthenticated && hasConnected.current) {
            // Disconnect when logged out
            wsManager.disconnect();
            hasConnected.current = false;
        }

        return () => {
            // Don't disconnect on unmount - let the app manage lifecycle
        };
    }, [isAuthenticated, isHydrated]);

    return <>{children}</>;
}
