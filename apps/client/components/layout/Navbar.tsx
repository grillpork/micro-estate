"use client";

import Link from "next/link";
import { useAuthModal } from "@/stores/useAuthModal";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SignIn from "@/components/auth/SignIn";

export const Navbar = () => {
  const router = useRouter();
  const { openModal, isOpen, closeModal, view } = useAuthModal();
  const { data: session, isPending } = authClient.useSession();
  const { signOut } = authClient;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh(); // Reset router cache
        },
      },
    });
    // Session hook will auto-update
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          MicroEstate
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isPending ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <Link
                href="/property/create"
                className="hidden md:block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                ลงประกาศฟรี
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold border border-blue-200">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}

                {/* Overlay to close dropdown */}
                {isDropdownOpen && (
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => openModal("signin")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              {view === "signin" ? "Welcome Back" : "Create Account"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {view === "signin"
                ? "Enter your credentials to access your account"
                : "Sign up to start your journey with MicroEstate"}
            </DialogDescription>
          </DialogHeader>

          {view === "signin" ? (
            <SignIn />
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">
                Sign Up Component Coming Soon
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Please use Sign In for now.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
};
