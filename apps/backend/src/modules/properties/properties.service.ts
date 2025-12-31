import { eq, and, desc, asc, sql, ilike, gte, lte, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db";
import { properties, propertyImages } from "../../db/schema";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../shared/errors";
import { canCreateListing } from "../verification/verification.service";
import { deleteFile } from "../media/media.service";
import {
  createPropertyEmbedding,
  deletePropertyEmbedding,
} from "./property-embedding.service";
import {
  CreatePropertyInput,
  UpdatePropertyInput,
  PropertyQuery,
} from "./properties.schema";
import {
  addAmenitiesToProperty,
  setPropertyAmenities,
  getPropertyAmenities,
} from "../amenities/amenities.service";

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50)}-${nanoid(8)}`;
}

/**
 * Get all properties with filters and pagination (Hybrid: page/limit or limit/offset)
 */
export async function getProperties(query: PropertyQuery) {
  const {
    page,
    limit,
    offset: providedOffset,
    sort,
    sortBy,
    ...filters
  } = query;

  // Hybrid pagination: use offset if provided, otherwise calculate from page
  const offset =
    providedOffset !== undefined ? providedOffset : (page - 1) * limit;
  // Calculate current page for response (useful when using offset-based)
  const currentPage =
    providedOffset !== undefined
      ? Math.floor(providedOffset / limit) + 1
      : page;

  // Build where conditions
  const conditions = [eq(properties.status, "active")];

  if (filters.propertyType) {
    conditions.push(eq(properties.propertyType, filters.propertyType as any));
  }
  if (filters.listingType) {
    conditions.push(eq(properties.listingType, filters.listingType as any));
  }
  if (filters.province) {
    conditions.push(eq(properties.province, filters.province));
  }
  if (filters.bedrooms) {
    conditions.push(eq(properties.bedrooms, filters.bedrooms));
  }
  if (filters.bathrooms) {
    conditions.push(eq(properties.bathrooms, filters.bathrooms));
  }
  if (filters.minPrice) {
    conditions.push(gte(properties.price, filters.minPrice.toString()));
  }
  if (filters.maxPrice) {
    conditions.push(lte(properties.price, filters.maxPrice.toString()));
  }
  if (filters.q) {
    conditions.push(ilike(properties.title, `%${filters.q}%`));
  }

  // Determine sort order
  const orderBy =
    sort === "asc"
      ? asc(properties[sortBy as keyof typeof properties] as any)
      : desc(properties[sortBy as keyof typeof properties] as any);

  // Get data
  const data = await db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(and(...conditions));

  return {
    data,
    total: Number(count),
    page: currentPage,
    limit,
    offset,
  };
}

/**
 * Get property by ID
 */
export async function getPropertyById(id: string) {
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!property) {
    throw new NotFoundError("Property");
  }

  // Get images
  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id))
    .orderBy(asc(propertyImages.order));

  // Get amenities
  const amenities = await getPropertyAmenities(id);

  return { ...property, images, amenities };
}

/**
 * Get property by slug
 */
export async function getPropertyBySlug(slug: string) {
  const [property] = await db
    .select()
    .from(properties)
    .where(or(eq(properties.slug, slug), eq(properties.id, slug)))
    .limit(1);

  if (!property) {
    throw new NotFoundError("Property");
  }

  // Increment views
  await db
    .update(properties)
    .set({ views: sql`${properties.views} + 1` })
    .where(eq(properties.id, property.id));

  // Get images
  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, property.id))
    .orderBy(asc(propertyImages.order));

  // Get amenities
  const amenities = await getPropertyAmenities(property.id);

  return { ...property, images, amenities };
}

/**
 * Create new property
 */
export async function createProperty(
  data: CreatePropertyInput,
  userId: string
) {
  // Check if user can create more listings
  const allowed = await canCreateListing(userId);
  if (!allowed) {
    throw new BadRequestError(
      "You have reached your listing limit. Please upgrade your verification level to create more listings."
    );
  }

  const id = nanoid();
  const slug = generateSlug(data.title);

  // Get thumbnail from first image
  const thumbnailUrl = data.images?.[0]?.url || null;

  const [property] = await db
    .insert(properties)
    .values({
      id,
      slug,
      userId,
      title: data.title,
      description: data.description,
      propertyType: data.propertyType as any,
      listingType: data.listingType as any,
      status: "draft",
      price: data.price.toString(),
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area?.toString(),
      landArea: data.landArea?.toString(),
      floors: data.floors,
      yearBuilt: data.yearBuilt,
      address: data.address,
      district: data.district,
      province: data.province,
      postalCode: data.postalCode,
      latitude: data.latitude?.toString(),
      longitude: data.longitude?.toString(),
      features: data.features ? JSON.stringify(data.features) : null,
      amenities: data.amenities ? JSON.stringify(data.amenities) : null,
      thumbnailUrl,
    })
    .returning();

  // Create images
  if (data.images?.length) {
    await db.insert(propertyImages).values(
      data.images.map((img, index) => ({
        id: nanoid(),
        propertyId: id,
        url: img.url,
        order: img.order ?? index,
        isPrimary: img.isPrimary ?? index === 0,
      }))
    );
  }

  // Handle Amenities
  const amenityIds = data.amenityIds || data.amenities; // Support both names
  if (amenityIds?.length) {
    await addAmenitiesToProperty(
      id,
      amenityIds.map((amenityId) => ({ amenityId }))
    );
  }

  return property;
}

/**
 * Update property
 */
export async function updateProperty(
  id: string,
  data: UpdatePropertyInput,
  userId: string
) {
  // Check ownership
  const [existing] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Property");
  }

  if (existing.userId !== userId) {
    throw new ForbiddenError("Not authorized to update this property");
  }

  // Get thumbnail from images if provided
  const thumbnailUrl = data.images?.[0]?.url || existing.thumbnailUrl;

  const [property] = await db
    .update(properties)
    .set({
      title: data.title,
      description: data.description,
      propertyType: data.propertyType as any,
      listingType: data.listingType as any,
      price: data.price?.toString(),
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area?.toString(),
      landArea: data.landArea?.toString(),
      floors: data.floors,
      yearBuilt: data.yearBuilt,
      address: data.address,
      district: data.district,
      province: data.province,
      postalCode: data.postalCode,
      latitude: data.latitude?.toString(),
      longitude: data.longitude?.toString(),
      features: data.features ? JSON.stringify(data.features) : undefined,
      amenities: data.amenities ? JSON.stringify(data.amenities) : undefined,
      thumbnailUrl,
      // Reset status to draft for admin review
      status: "draft",
      rejectionReason: null,
      updatedAt: new Date(),
    } as any)
    .where(eq(properties.id, id))
    .returning();

  // Update images if provided
  if (data.images?.length) {
    // Get old images from database
    const oldImages = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, id));

    // Delete old images from R2 storage
    for (const oldImage of oldImages) {
      // Extract key from URL (e.g., "https://...r2.dev/uploads/xxx.jpg" -> "uploads/xxx.jpg")
      const urlParts = oldImage.url.split("/");
      const key = urlParts.slice(-2).join("/"); // Get last 2 parts: "uploads/filename.ext"

      try {
        await deleteFile(key);
        console.log("Deleted old image from R2:", key);
      } catch (error) {
        console.error("Failed to delete old image from R2:", key, error);
        // Continue even if delete fails
      }
    }

    // Delete old images from database
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, id));

    // Insert new images
    await db.insert(propertyImages).values(
      data.images.map((img, index) => ({
        id: nanoid(),
        propertyId: id,
        url: img.url,
        order: img.order ?? index,
        isPrimary: img.isPrimary ?? index === 0,
      }))
    );
  }

  // Update amenities if provided
  const amenityIds = data.amenityIds || data.amenities;
  if (amenityIds) {
    await setPropertyAmenities(
      id,
      amenityIds.map((amenityId) => ({ amenityId }))
    );
  }

  return property;
}

/**
 * Delete property
 */
export async function deleteProperty(id: string, userId: string) {
  // Check ownership
  const [existing] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Property");
  }

  if (existing.userId !== userId) {
    throw new ForbiddenError("Not authorized to delete this property");
  }

  // Get all images for this property
  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id));

  // Delete images from R2 storage
  for (const image of images) {
    const urlParts = image.url.split("/");
    const key = urlParts.slice(-2).join("/");

    try {
      await deleteFile(key);
      console.log("Deleted image from R2:", key);
    } catch (error) {
      console.error("Failed to delete image from R2:", key, error);
    }
  }

  // Delete property embedding (if exists)
  await deletePropertyEmbedding(id);

  // Delete property (images will be cascade deleted)
  await db.delete(properties).where(eq(properties.id, id));

  return { deleted: true };
}

/**
 * Get user's properties
 */
export async function getUserProperties(userId: string) {
  return db
    .select()
    .from(properties)
    .where(eq(properties.userId, userId))
    .orderBy(desc(properties.createdAt));
}

// ===== Admin Functions =====

/**
 * Get pending properties for approval
 */
export async function getPendingProperties() {
  return db
    .select()
    .from(properties)
    .where(eq(properties.status, "draft"))
    .orderBy(desc(properties.createdAt));
}

/**
 * Get all properties for admin (any status)
 */
export async function getAllPropertiesAdmin() {
  return db.select().from(properties).orderBy(desc(properties.createdAt));
}

/**
 * Approve property (change status to active)
 */
export async function approveProperty(id: string) {
  const [existing] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Property");
  }

  const [updated] = await db
    .update(properties)
    .set({
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(properties.id, id))
    .returning();

  // Generate embedding for AI matching (async, don't block response)
  createPropertyEmbedding(id)
    .then((success) => {
      if (success) {
        console.log(`Property embedding created for: ${id}`);
      } else {
        console.warn(`Failed to create property embedding for: ${id}`);
      }
    })
    .catch((error) => {
      console.error(`Error creating property embedding: ${error}`);
    });

  return updated;
}

/**
 * Reject property (change status to rejected)
 */
export async function rejectProperty(id: string, reason: string) {
  const [existing] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Property");
  }

  const [updated] = await db
    .update(properties)
    .set({
      status: "rejected",
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(properties.id, id))
    .returning();

  return updated;
}

// Increment property views
export async function incrementPropertyViews(id: string): Promise<void> {
  await db
    .update(properties)
    .set({
      views: sql`${properties.views} + 1`,
    })
    .where(eq(properties.id, id));
}
