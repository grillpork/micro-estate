import { Suspense } from "react";
import { Sidebar } from "@/components/layout";
import { Navbar } from "@/components/layout";

function SidebarFallback() {
  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-20 bg-background border-r shadow-xl flex flex-col">
      <div className="h-16 flex items-center justify-center border-b shrink-0" />
      <div className="flex-1 py-6 px-3" />
    </aside>
  );
}

function NavbarFallback() {
  return (
    <nav className="h-16 border-b bg-background flex items-center px-4">
      <div className="h-8 w-32 bg-muted rounded animate-pulse" />
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/10">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <Suspense fallback={<SidebarFallback />}>
          <Sidebar />
        </Suspense>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden md:ml-20 transition-all duration-300">
        {/* Mobile Header/Navbar */}
        <div className="md:hidden shrink-0">
          <Suspense fallback={<NavbarFallback />}>
            <Navbar />
          </Suspense>
        </div>

        <main className="w-full mx-auto flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
