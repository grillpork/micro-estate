import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { success, created, paginate } from "../../shared/utils";
import { idParamSchema } from "../../shared/schemas";
import {
  authMiddleware,
  optionalAuth,
  agentOrAdmin,
  adminOnly,
} from "../../shared/middleware";
import type { AppEnv } from "../../shared/types";
import * as service from "./properties.service";
import { syncPropertyEmbeddings } from "./property-embedding.service";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyQuerySchema,
} from "./properties.schema";

export const propertiesRoutes = new Hono<AppEnv>();

// ===== Public Routes =====

// Get all properties (with filters)
propertiesRoutes.get(
  "/",
  zValidator("query", propertyQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const result = await service.getProperties(query);
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

// Get property by slug (for SEO-friendly URLs)
propertiesRoutes.get("/slug/:slug", async (c) => {
  const slug = c.req.param("slug");
  const property = await service.getPropertyBySlug(slug);
  return success(c, property);
});

// Get property by ID or Slug
propertiesRoutes.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const property = await service.getPropertyByIdOrSlug(id);
  return success(c, property);
});

// Increment property views
propertiesRoutes.post(
  "/:id/view",
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    await service.incrementPropertyViews(id);
    return success(c, { success: true });
  }
);

// Get current user's properties (must be before /:id to avoid conflict)
propertiesRoutes.get("/my/listings", authMiddleware, async (c) => {
  const user = c.get("user");
  const properties = await service.getUserProperties(user.id);
  return success(c, properties);
});

// ===== Protected Routes (Agent or Admin) =====

// Create property (all authenticated users, but regular users limited to 1)
propertiesRoutes.post(
  "/",
  authMiddleware,
  zValidator("json", createPropertySchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user");
    const property = await service.createProperty(body, user.id);
    return created(c, property);
  }
);

// Update property
propertiesRoutes.put(
  "/:id",
  authMiddleware,
  zValidator("param", idParamSchema),
  zValidator("json", updatePropertySchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const user = c.get("user");
    const property = await service.updateProperty(id, body, user.id);
    return success(c, property);
  }
);

// Delete property
propertiesRoutes.delete(
  "/:id",
  authMiddleware,
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = c.get("user");
    const result = await service.deleteProperty(id, user.id);
    return success(c, result);
  }
);

// ===== Admin Routes =====

// Get pending properties for approval
propertiesRoutes.get("/admin/pending", authMiddleware, adminOnly, async (c) => {
  const properties = await service.getPendingProperties();
  return success(c, properties);
});

// Get all properties for admin (any status)
propertiesRoutes.get("/admin/all", authMiddleware, adminOnly, async (c) => {
  const properties = await service.getAllPropertiesAdmin();
  return success(c, properties);
});

// Approve property
propertiesRoutes.post(
  "/admin/:id/approve",
  authMiddleware,
  adminOnly,
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const property = await service.approveProperty(id);
    return success(c, property);
  }
);

// Reject property
const rejectPropertySchema = z.object({
  reason: z.string().min(1, "กรุณาระบุเหตุผล"),
});

propertiesRoutes.post(
  "/admin/:id/reject",
  authMiddleware,
  adminOnly,
  zValidator("param", idParamSchema),
  zValidator("json", rejectPropertySchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { reason } = c.req.valid("json");
    const property = await service.rejectProperty(id, reason);
    return success(c, property);
  }
);

// Sync property embeddings (for existing active properties without embeddings)
propertiesRoutes.post(
  "/admin/sync-embeddings",
  authMiddleware,
  adminOnly,
  async (c) => {
    const result = await syncPropertyEmbeddings();
    return success(c, {
      message: `Synced ${result.success} embeddings (${result.failed} failed)`,
      ...result,
    });
  }
);
