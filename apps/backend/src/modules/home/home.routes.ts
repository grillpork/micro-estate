import { Hono } from "hono";
import { success } from "../../shared/utils";
import type { AppEnv } from "../../shared/types";
import * as service from "./home.service";

export const homeRoutes = new Hono<AppEnv>();

// ===== Public Routes (no auth required) =====

// Get full home page data
homeRoutes.get("/", async (c) => {
  const data = await service.getHomePageData();
  return success(c, data);
});

// Get stats only
homeRoutes.get("/stats", async (c) => {
  const stats = await service.getHomeStats();
  return success(c, stats);
});

// Get property type counts
homeRoutes.get("/property-types", async (c) => {
  const counts = await service.getPropertyTypeCounts();
  return success(c, counts);
});

// Get featured properties
homeRoutes.get("/featured", async (c) => {
  const limit = Number(c.req.query("limit")) || 6;
  const properties = await service.getFeaturedProperties(limit);
  return success(c, properties);
});
