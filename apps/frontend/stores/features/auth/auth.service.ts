/**
 * Auth Service
 * Handles all authentication-related API calls
 */
import { createAuthClient } from "better-auth/react";

// Base URL without /api/v1 for better-auth
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
  "http://localhost:4000";

/**
 * Better Auth client for React
 * Provides hooks like useSession, signIn, signUp, signOut
 */
export const authClient = createAuthClient({
  baseURL: BASE_URL,
});

// Export commonly used methods
export const { signIn, signUp, signOut, useSession } = authClient;

// Export the entire client for accessing other methods
export default authClient;
