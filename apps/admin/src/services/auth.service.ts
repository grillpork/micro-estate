import { createAuthClient } from "better-auth/react";

// Better Auth uses /api/auth/* path, not /api/v1/*
// So we need the root URL, not the API v1 URL
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL || "http://localhost:4000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
