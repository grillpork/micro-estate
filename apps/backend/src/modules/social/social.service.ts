import { db } from "../../db";
import { posts, postLikes, postComments, users } from "../../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export const socialService = {
  // Get all posts (Feed)
  getPosts: async (userId?: string, limit: number = 20, offset: number = 0) => {
    // using query builder for stability
    const postsResult = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit: limit,
      offset: offset,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Map result to match expected structure and add isLiked status
    const postsWithStatus = await Promise.all(
      postsResult.map(async (post) => {
        let isLiked = false;
        if (userId) {
          const like = await db.query.postLikes.findFirst({
            where: and(
              eq(postLikes.postId, post.id),
              eq(postLikes.userId, userId)
            ),
          });
          isLiked = !!like;
        }

        return {
          ...post,
          isLiked,
        };
      })
    );

    return postsWithStatus;
  },

  // Create Post
  createPost: async (
    userId: string,
    content?: string,
    images: string[] = []
  ) => {
    const [post] = await db
      .insert(posts)
      .values({
        id: nanoid(),
        userId,
        content,
        images,
      })
      .returning();

    // Return with user info for immediate display
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        name: true,
        image: true,
      },
    });

    return { ...post, user, isLiked: false };
  },

  // Delete Post
  deletePost: async (postId: string, userId: string) => {
    // Check ownership
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) throw new Error("Post not found");
    if (post.userId !== userId) throw new Error("Unauthorized");

    await db.delete(posts).where(eq(posts.id, postId));
    return true;
  },

  // Toggle Like
  toggleLike: async (postId: string, userId: string) => {
    const existingLike = await db.query.postLikes.findFirst({
      where: and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)),
    });

    if (existingLike) {
      // Unlike
      await db
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

      // Decrement count
      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, postId));

      return { isLiked: false };
    } else {
      // Like
      await db.insert(postLikes).values({ postId, userId });

      // Increment count
      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, postId));

      return { isLiked: true };
    }
  },

  // Get Comments
  getComments: async (postId: string) => {
    return db.query.postComments.findMany({
      where: eq(postComments.postId, postId),
      orderBy: [desc(postComments.createdAt)],
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
  addComment: async (postId: string, userId: string, content: string) => {
    const [comment] = await db
      .insert(postComments)
      .values({
        id: nanoid(),
        postId,
        userId,
        content,
      })
      .returning();

    // Increment comment count
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, postId));

    // Return with user info
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        name: true,
        image: true,
      },
    });

    return { ...comment, user };
  },

  // Delete Comment
  deleteComment: async (commentId: string, userId: string) => {
    const comment = await db.query.postComments.findFirst({
      where: eq(postComments.id, commentId),
    });

    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== userId) throw new Error("Unauthorized");

    await db.delete(postComments).where(eq(postComments.id, commentId));

    // Decrement count
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} - 1` })
      .where(eq(posts.id, comment.postId));

    return true;
  },
};
