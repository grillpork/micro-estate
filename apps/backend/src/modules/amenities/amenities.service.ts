import { eq, and, asc, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db";
import {
  amenities,
  propertyAmenities,
  type Amenity,
  type AmenityCategory,
} from "../../db/schema";
import { NotFoundError, BadRequestError } from "../../shared/errors";

// ===== CRUD for Master Amenities =====

/**
 * Get all amenities, optionally filtered by category
 */
export async function getAllAmenities(
  category?: AmenityCategory,
  activeOnly = true
): Promise<Amenity[]> {
  const conditions = [];

  if (activeOnly) {
    conditions.push(eq(amenities.isActive, true));
  }

  if (category) {
    conditions.push(eq(amenities.category, category));
  }

  return db
    .select()
    .from(amenities)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      asc(amenities.category),
      asc(amenities.order),
      asc(amenities.name)
    );
}

/**
 * Get amenities grouped by category
 */
export async function getAmenitiesGroupedByCategory(activeOnly = true) {
  const allAmenities = await getAllAmenities(undefined, activeOnly);

  const grouped = allAmenities.reduce(
    (acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = [];
      }
      acc[amenity.category].push(amenity);
      return acc;
    },
    {} as Record<string, Amenity[]>
  );

  return grouped;
}

/**
 * Get amenity by ID
 */
export async function getAmenityById(id: string): Promise<Amenity> {
  const [amenity] = await db
    .select()
    .from(amenities)
    .where(eq(amenities.id, id))
    .limit(1);

  if (!amenity) {
    throw new NotFoundError("Amenity");
  }

  return amenity;
}

/**
 * Get amenity by name
 */
export async function getAmenityByName(name: string): Promise<Amenity | null> {
  const [amenity] = await db
    .select()
    .from(amenities)
    .where(eq(amenities.name, name))
    .limit(1);

  return amenity || null;
}

/**
 * Create a new amenity (Admin only)
 */
export async function createAmenity(data: {
  name: string;
  nameTh?: string;
  description?: string;
  descriptionTh?: string;
  category: AmenityCategory;
  icon?: string;
  order?: number;
}): Promise<Amenity> {
  // Check if name already exists
  const existing = await getAmenityByName(data.name);
  if (existing) {
    throw new BadRequestError(
      `Amenity with name "${data.name}" already exists`
    );
  }

  const [amenity] = await db
    .insert(amenities)
    .values({
      id: nanoid(),
      name: data.name,
      nameTh: data.nameTh,
      description: data.description,
      descriptionTh: data.descriptionTh,
      category: data.category,
      icon: data.icon,
      order: data.order ?? 0,
      isActive: true,
    })
    .returning();

  return amenity;
}

/**
 * Update an amenity (Admin only)
 */
export async function updateAmenity(
  id: string,
  data: {
    name?: string;
    nameTh?: string;
    description?: string;
    descriptionTh?: string;
    category?: AmenityCategory;
    icon?: string;
    order?: number;
    isActive?: boolean;
  }
): Promise<Amenity> {
  await getAmenityById(id); // Check exists

  // If updating name, check for duplicates
  if (data.name) {
    const existing = await getAmenityByName(data.name);
    if (existing && existing.id !== id) {
      throw new BadRequestError(
        `Amenity with name "${data.name}" already exists`
      );
    }
  }

  const [amenity] = await db
    .update(amenities)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(amenities.id, id))
    .returning();

  return amenity;
}

/**
 * Delete an amenity (Admin only)
 */
export async function deleteAmenity(id: string): Promise<void> {
  await getAmenityById(id); // Check exists
  await db.delete(amenities).where(eq(amenities.id, id));
}

// ===== Property Amenities (Junction) =====

/**
 * Get all amenities for a property
 */
export async function getPropertyAmenities(propertyId: string) {
  const result = await db
    .select({
      id: propertyAmenities.id,
      propertyId: propertyAmenities.propertyId,
      amenityId: propertyAmenities.amenityId,
      note: propertyAmenities.note,
      createdAt: propertyAmenities.createdAt,
      amenity: amenities,
    })
    .from(propertyAmenities)
    .innerJoin(amenities, eq(propertyAmenities.amenityId, amenities.id))
    .where(eq(propertyAmenities.propertyId, propertyId))
    .orderBy(asc(amenities.category), asc(amenities.order));

  return result;
}

/**
 * Get property amenities grouped by category
 */
export async function getPropertyAmenitiesGrouped(propertyId: string) {
  const propertyAmenitiesList = await getPropertyAmenities(propertyId);

  const grouped = propertyAmenitiesList.reduce(
    (acc, item) => {
      const category = item.amenity.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        ...item.amenity,
        note: item.note,
      });
      return acc;
    },
    {} as Record<string, (Amenity & { note: string | null })[]>
  );

  return grouped;
}

/**
 * Add amenities to a property
 */
export async function addAmenitiesToProperty(
  propertyId: string,
  amenityData: { amenityId: string; note?: string }[]
): Promise<void> {
  if (amenityData.length === 0) return;

  // Validate all amenity IDs exist
  const amenityIds = amenityData.map((a) => a.amenityId);
  const existingAmenities = await db
    .select({ id: amenities.id })
    .from(amenities)
    .where(inArray(amenities.id, amenityIds));

  if (existingAmenities.length !== amenityIds.length) {
    throw new BadRequestError("One or more amenity IDs are invalid");
  }

  // Insert (ignore duplicates using ON CONFLICT)
  await db
    .insert(propertyAmenities)
    .values(
      amenityData.map((a) => ({
        id: nanoid(),
        propertyId,
        amenityId: a.amenityId,
        note: a.note,
      }))
    )
    .onConflictDoNothing();
}

/**
 * Remove an amenity from a property
 */
export async function removeAmenityFromProperty(
  propertyId: string,
  amenityId: string
): Promise<void> {
  await db
    .delete(propertyAmenities)
    .where(
      and(
        eq(propertyAmenities.propertyId, propertyId),
        eq(propertyAmenities.amenityId, amenityId)
      )
    );
}

/**
 * Replace all amenities for a property (set operation)
 */
export async function setPropertyAmenities(
  propertyId: string,
  amenityData: { amenityId: string; note?: string }[]
): Promise<void> {
  // Remove all existing
  await db
    .delete(propertyAmenities)
    .where(eq(propertyAmenities.propertyId, propertyId));

  // Add new ones
  if (amenityData.length > 0) {
    await addAmenitiesToProperty(propertyId, amenityData);
  }
}

/**
 * Get amenity statistics
 */
export async function getAmenityStats() {
  const stats = await db
    .select({
      amenityId: propertyAmenities.amenityId,
      amenityName: amenities.name,
      amenityNameTh: amenities.nameTh,
      category: amenities.category,
      count: sql<number>`count(*)::int`,
    })
    .from(propertyAmenities)
    .innerJoin(amenities, eq(propertyAmenities.amenityId, amenities.id))
    .groupBy(
      propertyAmenities.amenityId,
      amenities.name,
      amenities.nameTh,
      amenities.category
    )
    .orderBy(sql`count(*) DESC`);

  return stats;
}
