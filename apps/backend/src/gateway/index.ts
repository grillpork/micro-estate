import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";

import { env } from "@/config/env";
import { errorHandler, rateLimiter } from "@/shared/middleware";
import { yoga } from "@/modules/graphql";


import v1 from "./v1";

const gateway = new Hono();

// ===== Global Middleware =====
gateway.use("*", timing());
gateway.use("*", logger());
gateway.use("*", secureHeaders());
gateway.use(
  "*",
  cors({
    origin: [env.FRONTEND_URL, env.ADMIN_URL],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting (1000 requests per minute) - except GraphQL and WebSocket
gateway.use("/api/v1/*", rateLimiter({ limit: 1000, window: 60 }));

// ===== Health Check =====
gateway.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
);

// ===== GraphQL Endpoint =====
gateway.all("/api/v1/graphql", async (c) => {
  return yoga.handle(c.req.raw);
});

// ===== Better Auth (must be at /api/auth for default client) =====
import { auth } from "@/lib/auth";
gateway.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// ===== API Versions =====
gateway.route("/api/v1", v1);

// ===== Error Handler =====
gateway.onError(errorHandler);

// ===== 404 Handler =====
gateway.notFound((c) =>
  c.json(
    {
      success: false,
      error: "Not Found",
      code: "NOT_FOUND",
    },
    404
  )
);

export default gateway;
