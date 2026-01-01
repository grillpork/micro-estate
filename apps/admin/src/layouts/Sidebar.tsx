import { useState } from "react";
import clsx from "clsx";
import { LayoutDashboard, ShieldCheck, Box } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "verifications", label: "Verifications", icon: ShieldCheck },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        "fixed left-0 top-0 z-50 h-screen bg-gray-900 text-white shadow-xl transition-all duration-300 ease-in-out overflow-hidden",
        isHovered ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-center border-b border-gray-800 transition-all duration-300">
        <div
          className={clsx(
            "flex items-center gap-2",
            isHovered ? "px-6" : "justify-center"
          )}
        >
          <Box className="h-8 w-8 text-blue-500 shrink-0" />
          <h1
            className={clsx(
              "text-xl font-bold whitespace-nowrap transition-all duration-300 origin-left",
              isHovered
                ? "opacity-100 translate-x-0 w-auto"
                : "opacity-0 -translate-x-4 w-0 hidden"
            )}
          >
            Admin Panel
          </h1>
        </div>
      </div>

      <nav className="mt-6 px-2 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={clsx(
              "relative flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors group",
              activeTab === item.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            <item.icon className="h-6 w-6 shrink-0" />
            <span
              className={clsx(
                "whitespace-nowrap transition-all duration-300",
                isHovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 absolute left-14"
              )}
            >
              {item.label}
            </span>

            {/* Tooltip for collapsed state */}
            {!isHovered && (
              <div className="absolute left-full ml-2 hidden rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-md group-hover:block z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-20 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
