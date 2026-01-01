"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/stores/useAuthModal";

const SignIn = () => {
  const router = useRouter();
  const { closeModal, setView } = useAuthModal();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = authClient;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/", // Still good to have defaults
        fetchOptions: {
          onError: (ctx) => {
            if (ctx.error.status === 429) {
              toast.error("Too many login attempts. Please try again later.");
            } else {
              toast.error(ctx.error.message || "Invalid email or password");
            }
            setIsLoading(false);
          },
          onSuccess: () => {
            toast.success("Signed in successfully");
            closeModal();
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <button
          onClick={() => setView("signup")}
          className="text-blue-600 hover:underline font-medium focus:outline-none"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default SignIn;
