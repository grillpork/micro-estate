import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  CheckCircle2,
  MapPin,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  ChevronRight,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/" },
    { id: "properties", label: "Properties", icon: Home, to: "/properties" },
    {
      id: "verifications",
      label: "Verifications",
      icon: CheckCircle2,
      to: "/verifications",
    },
    { id: "amenities", label: "Amenities", icon: MapPin, to: "/amenities" },
  ];

  return (
    <aside className="w-[var(--sidebar-width)] glass border-r border-slate-200 min-h-screen py-8 flex flex-col fixed left-0 top-0 bottom-0 z-50">
      <div className="px-8 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-200">
          <Home className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">
            Micro Estate
          </h1>
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-500">
            Admin Portal
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group relative w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 overflow-hidden",
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )
              }
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="font-semibold text-sm tracking-wide">
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-600 rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 mt-auto space-y-1">
        <button className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group">
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span className="font-semibold text-sm tracking-wide">Sign Out</span>
        </button>

        <div className="pt-6 px-4 border-t border-slate-100 mt-4">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                Admin User
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                admin@estate.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function DashboardLayout() {
  const location = useLocation();
  const pageTitle =
    location.pathname === "/" ? "Dashboard" : location.pathname.split("/")[1];

  return (
    <div className="flex bg-[#fcfdfe] min-h-screen font-sans selection:bg-blue-100 selection:text-blue-700">
      <Sidebar />

      <main className="flex-1 ml-[var(--sidebar-width)] min-h-screen flex flex-col relative">
        <header className="h-[var(--header-height)] px-10 glass border-b border-slate-200/50 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
              {pageTitle}
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-400 font-medium text-sm">
                Overview
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>

            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:translate-y-[-1px] transition-all active:translate-y-[0px]">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </header>

        <div className="p-10 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="px-10 py-6 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
          <p>&copy; 2025 Micro Estate Admin. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-500 transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-blue-500 transition-colors">
              Support
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
