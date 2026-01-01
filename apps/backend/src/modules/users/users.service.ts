import { eq, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { NotFoundError } from "../../shared/errors";
import { uploadFile, deleteFile } from "../media/media.service";
import type { UpdateUserInput } from "./users.schema";

export async function getUsers() {
  return db.select().from(users);
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user || null;
}

/**
 * Search users by name or email
 */
export async function searchUsers(query: string, currentUserId: string) {
  if (!query || query.length < 2) {
    return [];
  }

  const searchPattern = `%${query}%`;

  const results = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(
      or(ilike(users.name, searchPattern), ilike(users.email, searchPattern))
    )
    .limit(10);

  // Filter out current user
  return results.filter((user) => user.id !== currentUserId);
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  if (!user) {
    throw new NotFoundError("User");
  }

  return user;
}

export async function deleteUser(id: string) {
  const [user] = await db.delete(users).where(eq(users.id, id)).returning();

  if (!user) {
    throw new NotFoundError("User");
  }

  return user;
}

/**
 * Update user profile image
 */
export async function updateProfileImage(userId: string, file: File) {
  // Get current user to check for existing image
  const currentUser = await getUserById(userId);
  if (!currentUser) {
    throw new NotFoundError("User");
  }

  // Delete old image if exists
  if (currentUser.image) {
    try {
      // Extract key from URL
      const url = new URL(currentUser.image);
      const key = url.pathname.slice(1); // Remove leading /
      await deleteFile(key);
    } catch {
      // Ignore deletion errors
    }
  }

  // Upload new image
  const result = await uploadFile(file, "upload/images/avatars");

  // Update user with new image URL
  const [updatedUser] = await db
    .update(users)
    .set({ image: result.url, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return { image: updatedUser.image };
}
