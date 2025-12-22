import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./config/env";
import { demandRoutes } from "./routes";

const app = new Hono();

// ===== Middleware =====
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:4000", "http://localhost:3000"],
  })
);

// ===== Health Check =====
app.get("/", (c) => {
  return c.json({
    service: "micro-estate-rag",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== API Routes =====
app.route("/api/demands", demandRoutes);

// ===== Error Handler =====
app.onError((err, c) => {
  console.error("RAG Service Error:", err);
  return c.json(
    {
      success: false,
      error: err.message || "Internal server error",
    },
    500
  );
});

// ===== Start Server =====
console.log(`🤖 RAG Service starting on port ${env.PORT}`);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
