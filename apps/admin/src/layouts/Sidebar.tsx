import { useState } from "react";
import clsx from "clsx";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "verifications", label: "Verifications", icon: "✅" },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-8 px-4">Admin</h1>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={clsx(
              "w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors",
              activeTab === item.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex bg-gray-100 min-h-screen text-gray-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8">
        {/* Pass activeTab to children if needed via context or props, 
            but for now we'll handle routing simply in App based on state there 
            Wait, Layout should prob just wrap. */}

        {/* Actually, let's keep state in App and pass down, or use a router. 
            Since no router was requested/installed explicitly (besides react-query), 
            I'll implement simple state-based routing in App.tsx for now to keep dependencies low 
            as user only specified a few libs. But usually React Router is used. 
            User didn't install react-router-dom. I'll stick to state for simplicity.
        */}
      </main>
    </div>
  );
}
