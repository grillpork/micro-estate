import { db } from "../../db";
import {
  shortVideos,
  shortVideoLikes,
  shortVideoComments,
  userFollows,
  users,
} from "../../db/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export const shortsService = {
  // Get Shorts Feed
  getFeed: async (userId?: string, limit: number = 10, offset: number = 0) => {
    // Basic feed: latest videos
    // In future: mix of following + recommended
    const videos = await db.query.shortVideos.findMany({
      orderBy: [desc(shortVideos.createdAt)],
      limit: limit,
      offset: offset,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Enrich with personalized data (isLiked, isFollowing)
    const enrichedVideos = await Promise.all(
      videos.map(async (video) => {
        let isLiked = false;
        let isFollowing = false;

        if (userId) {
          // Check Like
          const like = await db.query.shortVideoLikes.findFirst({
            where: and(
              eq(shortVideoLikes.videoId, video.id),
              eq(shortVideoLikes.userId, userId)
            ),
          });
          isLiked = !!like;

          // Check Follow
          if (video.userId !== userId) {
            const follow = await db.query.userFollows.findFirst({
              where: and(
                eq(userFollows.followerId, userId),
                eq(userFollows.followingId, video.userId)
              ),
            });
            isFollowing = !!follow;
          }
        }

        return {
          ...video,
          isLiked,
          isFollowing,
        };
      })
    );

    return enrichedVideos;
  },

  // Create Short
  createShort: async (
    userId: string,
    videoUrl: string,
    description?: string,
    thumbnailUrl?: string
  ) => {
    // Note: Video URL should point to the uploaded file.
    // "SD Resolution" enforcement is assumed to be handled by the uploader or client-side check for this MVP,
    // or we can just tag it here.

    const [video] = await db
      .insert(shortVideos)
      .values({
        id: nanoid(),
        userId,
        videoUrl,
        thumbnailUrl,
        description,
      })
      .returning();

    return video;
  },

  // Delete Short
  deleteShort: async (videoId: string, userId: string) => {
    const video = await db.query.shortVideos.findFirst({
      where: eq(shortVideos.id, videoId),
    });

    if (!video) throw new Error("Video not found");
    if (video.userId !== userId) throw new Error("Unauthorized");

    await db.delete(shortVideos).where(eq(shortVideos.id, videoId));
    return true;
  },

  // Toggle Like
  toggleLike: async (videoId: string, userId: string) => {
    const existing = await db.query.shortVideoLikes.findFirst({
      where: and(
        eq(shortVideoLikes.videoId, videoId),
        eq(shortVideoLikes.userId, userId)
      ),
    });

    if (existing) {
      await db
        .delete(shortVideoLikes)
        .where(
          and(
            eq(shortVideoLikes.videoId, videoId),
            eq(shortVideoLikes.userId, userId)
          )
        );

      await db
        .update(shortVideos)
        .set({ likesCount: sql`${shortVideos.likesCount} - 1` })
        .where(eq(shortVideos.id, videoId));

      return { isLiked: false };
    } else {
      await db.insert(shortVideoLikes).values({ videoId, userId });

      await db
        .update(shortVideos)
        .set({ likesCount: sql`${shortVideos.likesCount} + 1` })
        .where(eq(shortVideos.id, videoId));

      return { isLiked: true };
    }
  },

  // Toggle Follow
  toggleFollow: async (followerId: string, followingId: string) => {
    if (followerId === followingId) throw new Error("Cannot follow yourself");

    const existing = await db.query.userFollows.findFirst({
      where: and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.followingId, followingId)
      ),
    });

    if (existing) {
      await db
        .delete(userFollows)
        .where(
          and(
            eq(userFollows.followerId, followerId),
            eq(userFollows.followingId, followingId)
          )
        );
      return { isFollowing: false };
    } else {
      await db.insert(userFollows).values({ followerId, followingId });
      return { isFollowing: true };
    }
  },

  // Get Comments
  getComments: async (videoId: string) => {
    return db.query.shortVideoComments.findMany({
      where: eq(shortVideoComments.videoId, videoId),
      orderBy: [desc(shortVideoComments.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  },

  // Add Comment
  addComment: async (videoId: string, userId: string, content: string) => {
    const [comment] = await db
      .insert(shortVideoComments)
      .values({
        id: nanoid(),
        videoId,
        userId,
        content,
      })
      .returning();

    await db
      .update(shortVideos)
      .set({ commentsCount: sql`${shortVideos.commentsCount} + 1` })
      .where(eq(shortVideos.id, videoId));

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, name: true, image: true },
    });

    return { ...comment, user };
  },
};
