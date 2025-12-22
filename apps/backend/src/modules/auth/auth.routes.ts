import { Hono } from "hono";
import { auth } from "../../lib/auth";

export const authRoutes = new Hono();

// Handle all auth routes via Better Auth
authRoutes.all("/*", (c) => {
  return auth.handler(c.req.raw);
});
