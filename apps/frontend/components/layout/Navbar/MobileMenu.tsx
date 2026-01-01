"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  theme: string | undefined;
  onToggleTheme: () => void;
  isActive: (href: string) => boolean;
}

export function MobileMenu({
  isOpen,
  onClose,
  items,
  theme,
  onToggleTheme,
  isActive,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t bg-background md:hidden"
        >
          <div className="container mx-auto flex flex-col gap-1 px-4 py-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* Theme Toggle Mobile */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
