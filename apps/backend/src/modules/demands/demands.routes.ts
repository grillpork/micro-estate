import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { success, created, paginate } from "../../shared/utils";
import { idParamSchema } from "../../shared/schemas";
import { authMiddleware, agentOrAdmin } from "../../shared/middleware";
import type { AppEnv } from "../../shared/types";
import * as service from "./demands.service";
import * as matching from "./demands.matching";
import {
  createDemandSchema,
  updateDemandSchema,
  demandQuerySchema,
} from "./demands.schema";

export const demandsRoutes = new Hono<AppEnv>();

// ===== User Routes (Authenticated) =====

// Get current user's demands
demandsRoutes.get("/my", authMiddleware, async (c) => {
  const user = c.get("user");
  const demands = await service.getUserDemands(user.id);
  return success(c, demands);
});

// Get user's demand statistics
demandsRoutes.get("/my/stats", authMiddleware, async (c) => {
  const user = c.get("user");
  const stats = await service.getUserDemandStats(user.id);
  return success(c, stats);
});

// Create demand
demandsRoutes.post(
  "/",
  authMiddleware,
  zValidator("json", createDemandSchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user");
    const demand = await service.createDemand(body, user.id);

    // Auto-match with properties (async, non-blocking)
    matching
      .matchDemandWithProperties({ demandId: demand.id })
      .then((matches) => {
        if (matches.length > 0) {
          matching.storeMatchResults(demand.id, matches);
        }
      })
      .catch((error) => {
        console.error("Auto-matching failed:", error);
      });

    return created(c, demand);
  }
);

// Update demand
demandsRoutes.put(
  "/:id",
  authMiddleware,
  zValidator("param", idParamSchema),
  zValidator("json", updateDemandSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const user = c.get("user");
    const demand = await service.updateDemand(id, body, user.id);
    return success(c, demand);
  }
);

// Close demand (soft delete)
demandsRoutes.post(
  "/:id/close",
  authMiddleware,
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = c.get("user");
    const demand = await service.closeDemand(id, user.id);
    return success(c, demand);
  }
);

// Delete demand (hard delete)
demandsRoutes.delete(
  "/:id",
  authMiddleware,
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = c.get("user");
    const result = await service.deleteDemand(id, user.id);
    return success(c, result);
  }
);

// ===== Matching Routes =====

// Get matches for a demand
demandsRoutes.get(
  "/:id/matches",
  authMiddleware,
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = c.get("user");

    // Verify access
    await service.getDemandById(id, user.id);

    const matches = await matching.getDemandMatches(id);
    const count = await matching.countDemandMatches(id);

    return success(c, { matches, total: count });
  }
);

// Re-run matching for a demand
demandsRoutes.post(
  "/:id/matches/refresh",
  authMiddleware,
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = c.get("user");

    // Verify access
    await service.getDemandById(id, user.id);

    const matches = await matching.matchDemandWithProperties({ demandId: id });
    if (matches.length > 0) {
      await matching.storeMatchResults(id, matches);
    }

    return success(c, { matchCount: matches.length, matches });
  }
);

// Update match status (mark as viewed, saved, or contacted)
const updateMatchStatusSchema = z.object({
  isViewed: z.boolean().optional(),
  isSaved: z.boolean().optional(),
  isContacted: z.boolean().optional(),
});

demandsRoutes.patch(
  "/matches/:matchId",
  authMiddleware,
  zValidator("param", z.object({ matchId: z.string().min(1) })),
  zValidator("json", updateMatchStatusSchema),
  async (c) => {
    const { matchId } = c.req.valid("param");
    const body = c.req.valid("json");
    const user = c.get("user");

    const updated = await matching.updateMatchStatus(matchId, user.id, body);
    return success(c, updated);
  }
);

// ===== Agent Routes (View Public Demands) =====

// Get public demands (for agents to find matching buyers/renters)
// Note: This returns BLIND data - no user identity revealed
demandsRoutes.get(
  "/public",
  authMiddleware,
  agentOrAdmin,
  zValidator("query", demandQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const result = await service.getPublicDemands(query);
    return paginate(
      c,
      result.data,
      result.total,
      result.page,
      result.limit,
      result.offset
    );
  }
);

// Get single demand (if public or owner)
demandsRoutes.get(
  "/:id",
  authMiddleware,
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = c.get("user");
    const demand = await service.getDemandById(id, user.id);
    return success(c, demand);
  }
);
