import { createMiddleware } from "hono/factory";
import { auth } from "../../lib/auth";
import { UnauthorizedError, ForbiddenError } from "../errors";
import type { Role } from "../constants";

/**
 * Auth middleware - validates session and sets user in context
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new UnauthorizedError("Authentication required");
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
});

/**
 * Optional auth middleware - sets user if authenticated, but doesn't require it
 */
export const optionalAuth = createMiddleware(async (c, next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (session) {
      c.set("user", session.user);
      c.set("session", session.session);
    }
  } catch {
    // Ignore auth errors for optional auth
  }

  await next();
});

/**
 * Role guard middleware - requires specific roles
 */
export const requireRole = (...roles: Role[]) =>
  createMiddleware(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!roles.includes(user.role as Role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    await next();
  });

/**
 * Admin only middleware
 */
export const adminOnly = requireRole("admin" as Role);

/**
 * Agent or admin middleware
 */
export const agentOrAdmin = requireRole("agent" as Role, "admin" as Role);
