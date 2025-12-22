import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { success } from "../../shared/utils";
import { authMiddleware } from "../../shared/middleware";
import type { AppEnv } from "../../shared/types";
import * as service from "./favorites.service";

export const favoritesRoutes = new Hono<AppEnv>();

// All routes require authentication
favoritesRoutes.use("/*", authMiddleware);

// Get user's favorites
favoritesRoutes.get("/", async (c) => {
  const user = c.get("user");
  const favorites = await service.getUserFavorites(user.id);
  return success(c, favorites);
});

// Add to favorites
favoritesRoutes.post(
  "/:propertyId",
  zValidator("param", z.object({ propertyId: z.string().min(1) })),
  async (c) => {
    const user = c.get("user");
    const { propertyId } = c.req.valid("param");
    const favorite = await service.addFavorite(user.id, propertyId);
    return success(c, favorite, 201);
  }
);

// Remove from favorites
favoritesRoutes.delete(
  "/:propertyId",
  zValidator("param", z.object({ propertyId: z.string().min(1) })),
  async (c) => {
    const user = c.get("user");
    const { propertyId } = c.req.valid("param");
    const result = await service.removeFavorite(user.id, propertyId);
    return success(c, result);
  }
);

// Toggle favorite
favoritesRoutes.post(
  "/:propertyId/toggle",
  zValidator("param", z.object({ propertyId: z.string().min(1) })),
  async (c) => {
    const user = c.get("user");
    const { propertyId } = c.req.valid("param");
    const result = await service.toggleFavorite(user.id, propertyId);
    return success(c, result);
  }
);

// Check if favorited
favoritesRoutes.get(
  "/:propertyId/check",
  zValidator("param", z.object({ propertyId: z.string().min(1) })),
  async (c) => {
    const user = c.get("user");
    const { propertyId } = c.req.valid("param");
    const favorited = await service.isFavorited(user.id, propertyId);
    return success(c, { favorited });
  }
);
