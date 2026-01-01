"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  PlusSquare,
  Sparkles,
  MessageSquare,
  User,
  LogOut,
  Settings,
  Heart,
  List,
} from "lucide-react";
import { useSession, signOut } from "@/services";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "ภาพรวม",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "อสังหาฯ ของฉัน",
    href: "/my-properties",
    icon: Home,
  },
  {
    title: "ความต้องการของฉัน",
    href: "/my-demands",
    icon: List,
  },
  {
    title: "ลงประกาศใหม่",
    href: "/post-property",
    icon: PlusSquare,
  },
  {
    title: "AI Demand Match",
    href: "/match-demand",
    icon: Sparkles,
  },
  {
    title: "AI Chat",
    href: "/messages/ai",
    icon: MessageSquare,
  },
  {
    title: "รายการโปรด",
    href: "/favorites",
    icon: Heart,
  },
  {
    title: "โปรไฟล์",
    href: "/profile",
    icon: User,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-background border-r shadow-xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
        isHovered ? "w-64" : "w-20"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-center border-b shrink-0 transition-all duration-300">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 overflow-hidden whitespace-nowrap",
            isHovered ? "px-6" : "justify-center"
          )}
        >
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <span
            className={cn(
              "font-bold text-xl transition-all duration-300 origin-left",
              isHovered
                ? "opacity-100 translate-x-0 w-auto"
                : "opacity-0 -translate-x-4 w-0 hidden"
            )}
          >
            Micro Estate
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 shrink-0 transition-colors",
                  isActive ? "text-primary" : ""
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300 absolute left-14",
                  isHovered
                    ? "opacity-100 translate-x-0 relative left-0"
                    : "opacity-0 -translate-x-4"
                )}
              >
                {item.title}
              </span>

              {/* Tooltip-like label for collapsed state */}
              {!isHovered && (
                <div className="absolute left-full ml-2 hidden rounded-md bg-foreground text-background px-2 py-1 text-xs shadow-md group-hover:block z-50 whitespace-nowrap">
                  {item.title}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t space-y-2 shrink-0">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
            !isHovered && "justify-center px-0"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span
            className={cn(
              "whitespace-nowrap transition-all duration-300 overflow-hidden",
              isHovered ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
            )}
          >
            ออกจากระบบ
          </span>
        </Button>
      </div>
    </aside>
  );
}
