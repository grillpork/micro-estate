"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    showBackToHome?: boolean;
}

/**
 * Auth Layout wrapper for sign-in, sign-up, reset-password pages
 * Provides consistent styling with animated background
 */
export function AuthLayout({
    children,
    title,
    description,
    showBackToHome = true,
}: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
                <motion.div
                    className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Content */}
            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
                {/* Logo */}
                <Link
                    href="/"
                    className="mb-8 flex items-center gap-2 transition-transform hover:scale-105"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
                        <Building2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-2xl">
                        Micro<span className="text-primary">Estate</span>
                    </span>
                </Link>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    <div className="rounded-2xl border bg-card/80 p-8 shadow-xl backdrop-blur-sm">
                        {/* Header */}
                        <div className="mb-6 text-center">
                            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                        </div>

                        {/* Form Content */}
                        {children}
                    </div>

                    {/* Back to Home */}
                    {showBackToHome && (
                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            <Link
                                href="/"
                                className="text-primary hover:underline underline-offset-4"
                            >
                                ← กลับไปหน้าแรก
                            </Link>
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
