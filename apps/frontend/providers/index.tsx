"use client";

import { Toaster } from "sonner";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
    children: React.ReactNode;
}

/**
 * Root providers wrapper
 * Combines all providers in one place for cleaner layout
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <QueryProvider>
                {children}
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    toastOptions={{
                        duration: 4000,
                        classNames: {
                            toast: "font-sans",
                        },
                    }}
                />
            </QueryProvider>
        </ThemeProvider>
    );
}
