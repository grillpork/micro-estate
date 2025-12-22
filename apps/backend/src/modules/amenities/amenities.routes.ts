import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import * as amenitiesService from "./amenities.service";
import { authMiddleware, adminOnly } from "../../shared/middleware";
import type { AmenityCategory } from "../../db/schema";

const amenitiesRoutes = new Hono();

// ===== Validation Schemas =====
const createAmenitySchema = z.object({
  name: z.string().min(1).max(100),
  nameTh: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  descriptionTh: z.string().max(500).optional(),
  category: z.enum([
    "general",
    "security",
    "recreation",
    "convenience",
    "parking",
    "wellness",
    "outdoor",
    "utilities",
  ]),
  icon: z.string().max(100).optional(),
  order: z.number().int().min(0).optional(),
});

const updateAmenitySchema = createAmenitySchema.partial().extend({
  isActive: z.boolean().optional(),
});

const setPropertyAmenitiesSchema = z.object({
  amenities: z.array(
    z.object({
      amenityId: z.string(),
      note: z.string().max(255).optional(),
    })
  ),
});

// ===== Public Routes =====

/**
 * GET /amenities - Get all amenities
 * Query params: category, activeOnly
 */
amenitiesRoutes.get("/", async (c) => {
  const category = c.req.query("category") as AmenityCategory | undefined;
  const activeOnly = c.req.query("activeOnly") !== "false";

  const amenities = await amenitiesService.getAllAmenities(
    category,
    activeOnly
  );

  return c.json({ data: amenities });
});

/**
 * GET /amenities/grouped - Get amenities grouped by category
 */
amenitiesRoutes.get("/grouped", async (c) => {
  const activeOnly = c.req.query("activeOnly") !== "false";
  const grouped =
    await amenitiesService.getAmenitiesGroupedByCategory(activeOnly);

  return c.json({ data: grouped });
});

/**
 * GET /amenities/stats - Get amenity usage statistics
 */
amenitiesRoutes.get("/stats", async (c) => {
  const stats = await amenitiesService.getAmenityStats();
  return c.json({ data: stats });
});

/**
 * GET /amenities/:id - Get single amenity
 */
amenitiesRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const amenity = await amenitiesService.getAmenityById(id);

  return c.json({ data: amenity });
});

// ===== Admin Routes =====

/**
 * POST /amenities - Create new amenity (Admin only)
 */
amenitiesRoutes.post(
  "/",
  authMiddleware,
  adminOnly,
  zValidator("json", createAmenitySchema),
  async (c) => {
    const data = c.req.valid("json");
    const amenity = await amenitiesService.createAmenity(data);

    return c.json({ data: amenity }, 201);
  }
);

/**
 * PUT /amenities/:id - Update amenity (Admin only)
 */
amenitiesRoutes.put(
  "/:id",
  authMiddleware,
  adminOnly,
  zValidator("json", updateAmenitySchema),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const amenity = await amenitiesService.updateAmenity(id, data);

    return c.json({ data: amenity });
  }
);

/**
 * DELETE /amenities/:id - Delete amenity (Admin only)
 */
amenitiesRoutes.delete("/:id", authMiddleware, adminOnly, async (c) => {
  const id = c.req.param("id");
  await amenitiesService.deleteAmenity(id);

  return c.json({ message: "Amenity deleted successfully" });
});

// ===== Property Amenities Routes =====

/**
 * GET /amenities/property/:propertyId - Get amenities for a property
 */
amenitiesRoutes.get("/property/:propertyId", async (c) => {
  const propertyId = c.req.param("propertyId");
  const amenities = await amenitiesService.getPropertyAmenities(propertyId);

  return c.json({ data: amenities });
});

/**
 * GET /amenities/property/:propertyId/grouped - Get property amenities grouped by category
 */
amenitiesRoutes.get("/property/:propertyId/grouped", async (c) => {
  const propertyId = c.req.param("propertyId");
  const grouped =
    await amenitiesService.getPropertyAmenitiesGrouped(propertyId);

  return c.json({ data: grouped });
});

/**
 * PUT /amenities/property/:propertyId - Set amenities for a property (Property owner or Admin)
 */
amenitiesRoutes.put(
  "/property/:propertyId",
  authMiddleware,
  zValidator("json", setPropertyAmenitiesSchema),
  async (c) => {
    const propertyId = c.req.param("propertyId");
    const { amenities } = c.req.valid("json");

    // TODO: Add ownership check here
    await amenitiesService.setPropertyAmenities(propertyId, amenities);

    return c.json({ message: "Property amenities updated successfully" });
  }
);

/**
 * DELETE /amenities/property/:propertyId/:amenityId - Remove single amenity from property
 */
amenitiesRoutes.delete(
  "/property/:propertyId/:amenityId",
  authMiddleware,
  async (c) => {
    const propertyId = c.req.param("propertyId");
    const amenityId = c.req.param("amenityId");

    // TODO: Add ownership check here
    await amenitiesService.removeAmenityFromProperty(propertyId, amenityId);

    return c.json({ message: "Amenity removed from property" });
  }
);

export { amenitiesRoutes };
