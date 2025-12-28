"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/services";
import { useAuthStore } from "@/stores";

interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * Auth Provider
 * Syncs better-auth session with Zustand auth store
 * This prevents multiple components from calling get-session API
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const { data: session, isPending } = useSession();
    const { setUser, setLoading, isHydrated } = useAuthStore();
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Wait for store hydration before syncing
        if (!isHydrated) return;

        // Update loading state
        setLoading(isPending);

        // Only sync when session changes and not pending
        if (!isPending && !hasInitialized.current) {
            hasInitialized.current = true;
        }

        if (!isPending) {
            const user = session?.user
                ? {
                    id: session.user.id,
                    name: session.user.name || null,
                    email: session.user.email,
                    image: session.user.image || null,
                    role:
                        (session.user as { role?: string }).role ||
                        ("user" as "user" | "agent" | "admin"),
                }
                : null;
            setUser(user as import("@/types").User | null);
        }
    }, [session, isPending, isHydrated, setUser, setLoading]);

    return <>{children}</>;
}
