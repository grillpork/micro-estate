"use client";

/**
 * Query Provider
 * Wraps the app with React Query context
 */
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib";

interface QueryProviderProps {
    children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

