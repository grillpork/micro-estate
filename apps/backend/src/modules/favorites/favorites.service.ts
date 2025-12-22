import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db";
import { favorites, properties } from "../../db/schema";
import { NotFoundError, ConflictError } from "../../shared/errors";
import { createFavoriteNotification } from "../notifications/notifications.service";

// ===== Add Favorite =====
export async function addFavorite(userId: string, propertyId: string) {
  // Check if property exists
  const [property] = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.id, propertyId));

  if (!property) {
    throw new NotFoundError("Property");
  }

  // Check if already favorited
  const [existing] = await db
    .select()
    .from(favorites)
    .where(
      and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))
    );

  if (existing) {
    throw new ConflictError("Property already in favorites");
  }

  // Add to favorites
  const [favorite] = await db
    .insert(favorites)
    .values({
      id: nanoid(),
      userId,
      propertyId,
    })
    .returning();

  // Update property favorites count
  await db
    .update(properties)
    .set({ favorites: sql`${properties.favorites} + 1` })
    .where(eq(properties.id, propertyId));

  // Create notification for property owner
  await createFavoriteNotification(propertyId, userId);

  return favorite;
}

// ===== Remove Favorite =====
export async function removeFavorite(userId: string, propertyId: string) {
  const [favorite] = await db
    .delete(favorites)
    .where(
      and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))
    )
    .returning();

  if (!favorite) {
    throw new NotFoundError("Favorite");
  }

  // Update property favorites count
  await db
    .update(properties)
    .set({ favorites: sql`${properties.favorites} - 1` })
    .where(eq(properties.id, propertyId));

  return { removed: true };
}

// ===== Get User Favorites =====
export async function getUserFavorites(userId: string) {
  return db.query.favorites.findMany({
    where: eq(favorites.userId, userId),
    with: {
      property: true,
    },
    orderBy: (favorites, { desc }) => [desc(favorites.createdAt)],
  });
}

// ===== Check if Favorited =====
export async function isFavorited(
  userId: string,
  propertyId: string
): Promise<boolean> {
  const [favorite] = await db
    .select()
    .from(favorites)
    .where(
      and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))
    );

  return !!favorite;
}

// ===== Toggle Favorite =====
export async function toggleFavorite(userId: string, propertyId: string) {
  const favorited = await isFavorited(userId, propertyId);

  if (favorited) {
    return { ...(await removeFavorite(userId, propertyId)), favorited: false };
  } else {
    await addFavorite(userId, propertyId);
    return { favorited: true };
  }
}
