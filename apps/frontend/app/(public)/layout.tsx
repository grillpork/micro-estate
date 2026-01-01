import { Suspense } from "react";
import { Navbar, Footer } from "@/components/layout";

function NavbarFallback() {
  return (
    <nav className="h-16 border-b bg-background flex items-center px-4">
      <div className="h-8 w-32 bg-muted rounded animate-pulse" />
    </nav>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
