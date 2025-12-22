import { Hono } from "hono";
import { success } from "../../shared/utils";
import { authMiddleware } from "../../shared/middleware";
import type { AppEnv } from "../../shared/types";
import * as service from "./dashboard.service";

export const dashboardRoutes = new Hono<AppEnv>();

// ===== Agent Dashboard Routes =====

// Get full dashboard data (stats + properties + activity)
dashboardRoutes.get("/", authMiddleware, async (c) => {
  const user = c.get("user");
  const dashboard = await service.getAgentDashboard(user.id);
  return success(c, dashboard);
});

// Get dashboard stats only
dashboardRoutes.get("/stats", authMiddleware, async (c) => {
  const user = c.get("user");
  const stats = await service.getAgentDashboardStats(user.id);
  return success(c, stats);
});

// Get agent's properties for dashboard
dashboardRoutes.get("/properties", authMiddleware, async (c) => {
  const user = c.get("user");
  const limit = Number(c.req.query("limit")) || 5;
  const properties = await service.getAgentProperties(user.id, limit);
  return success(c, properties);
});

// Get recent activity
dashboardRoutes.get("/activity", authMiddleware, async (c) => {
  const user = c.get("user");
  const limit = Number(c.req.query("limit")) || 10;
  const activity = await service.getAgentRecentActivity(user.id, limit);
  return success(c, activity);
});

// Get matched demands count
dashboardRoutes.get("/matched-demands", authMiddleware, async (c) => {
  const user = c.get("user");
  const count = await service.getAgentMatchedDemandsCount(user.id);
  return success(c, { count });
});
