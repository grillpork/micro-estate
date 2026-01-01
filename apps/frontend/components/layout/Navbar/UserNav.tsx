"use client";

import Link from "next/link";
import {
  User,
  Building2,
  Calendar,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/services";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
}

interface UserNavProps {
  user: UserWithRole;
}

export function UserNav({ user }: UserNavProps) {
  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent">
        <Avatar>
          {user?.image ? (
            <AvatarImage src={user.image} alt={user.name || ""} />
          ) : null}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </button>

      {/* Dropdown */}
      <div className="invisible absolute right-0 top-full mt-2 w-56 origin-top-right scale-95 rounded-xl border bg-card p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:scale-100 group-hover:opacity-100">
        <div className="px-3 py-2 border-b mb-2">
          <p className="font-medium">{user.name || "ผู้ใช้"}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        {user.role === "agent" || user.role === "admin" ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        ) : (
          <Link
            href="/become-agent"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <Building2 className="h-4 w-4" />
            เป็นตัวแทน
          </Link>
        )}

        <Link
          href="/bookings"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
        >
          <Calendar className="h-4 w-4" />
          รายการจอง
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
        >
          <User className="h-4 w-4" />
          โปรไฟล์
        </Link>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
