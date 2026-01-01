"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Building2, Menu, X, LogIn, UserPlus, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/services";
import { useUser, useIsAuthLoading } from "@/stores";
=======
import { useSession } from "@/services";
>>>>>>> 3f33e72 (feat: Add new UI components, chat features, and services, while updating admin layout, backend user service, and frontend pages.)
import { NotificationDropdown } from "@/components/notification/NotificationDropdown";
import { navItems } from "@/config/navigation";
import { UserNav } from "./Navbar/UserNav";
import { MobileMenu } from "./Navbar/MobileMenu";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
<<<<<<< HEAD
=======
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
>>>>>>> 3f33e72 (feat: Add new UI components, chat features, and services, while updating admin layout, backend user service, and frontend pages.)

  // Use auth store instead of useSession
  const user = useUser();
  const isPending = useIsAuthLoading();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.requireAuth) return true;
    if (!mounted) return false;
    if (!user) return false;
    if (item.roles && !item.roles.includes(user.role as string)) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/60">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-bold text-xl sm:block">
            Micro<span className="text-primary">Estate</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden sm:flex"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {!mounted || isPending ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <>
              {/* Notifications */}
              <NotificationDropdown />
              {/* User Menu */}
              <UserNav user={user} />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <LogIn className="mr-2 h-4 w-4" />
                  เข้าสู่ระบบ
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  สมัครสมาชิก
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={filteredNavItems}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        isActive={isActive}
      />
    </header>
  );
}
