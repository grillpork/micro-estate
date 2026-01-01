import {
  Home,
  Search,
  Building2,
  MessageSquare,
  LayoutDashboard,
  Sparkles,
  Heart,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requireAuth?: boolean;
  roles?: string[];
}

export const navItems: NavItem[] = [
  { label: "หน้าแรก", href: "/", icon: <Home className="h-4 w-4" /> },
  {
    label: "ค้นหาอสังหา",
    href: "/properties",
    icon: <Search className="h-4 w-4" />,
  },
  {
    label: "ประกาศขาย/เช่า",
    href: "/post-property",
    icon: <Building2 className="h-4 w-4" />,
    requireAuth: true,
    roles: ["agent", "admin"],
  },
  {
    label: "ข้อความ",
    href: "/messages",
    icon: <MessageSquare className="h-4 w-4" />,
    requireAuth: true,
  },
  {
    label: "รายการโปรด",
    href: "/favorites",
    icon: <Heart className="h-4 w-4" />,
    requireAuth: true,
  },
  {
    label: "AI จับคู่",
    href: "/match-demand",
    icon: <Sparkles className="h-4 w-4" />,
    requireAuth: true,
  },
  {
    label: "ประกาศต้องการ",
    href: "/post-demand",
    icon: <Building2 className="h-4 w-4" />,
    requireAuth: true,
    roles: ["agent", "admin"],
  },
  {
    label: "แดชบอร์ด",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    requireAuth: true,
    roles: ["agent", "admin"],
  },
];
