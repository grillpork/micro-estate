import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { socialService } from "./social.service";
import { authMiddleware } from "../../shared/middleware";
import { success, created } from "../../shared/utils";

import { AppEnv } from "../../shared/types";

export const socialRoutes = new Hono<AppEnv>();

const createPostSchema = z
  .object({
    content: z.string().optional(),
    images: z.array(z.string()).optional(),
  })
  .refine((data) => data.content || (data.images && data.images.length > 0), {
    message: "Post must have content or images",
  });

const commentSchema = z.object({
  content: z.string().min(1),
});

// GET /social/feed
socialRoutes.get("/feed", authMiddleware, async (c) => {
  const user = c.get("user");
  const limit = Number(c.req.query("limit")) || 20;
  const offset = Number(c.req.query("offset")) || 0;

  const posts = await socialService.getPosts(user?.id, limit, offset);
  return success(c, posts);
});

// POST /social/posts
socialRoutes.post(
  "/",
  authMiddleware,
  zValidator("json", createPostSchema),
  async (c) => {
    const user = c.get("user");
    const { content, images } = c.req.valid("json");

    const post = await socialService.createPost(user.id, content, images);
    return created(c, post);
  }
);

// DELETE /social/posts/:id
socialRoutes.delete("/posts/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const postId = c.req.param("id");

  await socialService.deletePost(postId, user.id);
  return success(c, { message: "Post deleted" });
});

// POST /social/posts/:id/like
socialRoutes.post("/posts/:id/like", authMiddleware, async (c) => {
  const user = c.get("user");
  const postId = c.req.param("id");

  const result = await socialService.toggleLike(postId, user.id);
  return success(c, result);
});

// GET /social/posts/:id/comments
socialRoutes.get("/posts/:id/comments", authMiddleware, async (c) => {
  const postId = c.req.param("id");
  const comments = await socialService.getComments(postId);
  return success(c, comments);
});

// POST /social/posts/:id/comments
socialRoutes.post(
  "/posts/:id/comments",
  authMiddleware,
  zValidator("json", commentSchema),
  async (c) => {
    const user = c.get("user");
    const postId = c.req.param("id");
    const { content } = c.req.valid("json");

    const comment = await socialService.addComment(postId, user.id, content);
    return created(c, comment);
  }
);

// DELETE /social/comments/:id
socialRoutes.delete("/comments/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const commentId = c.req.param("id");

  await socialService.deleteComment(commentId, user.id);
  return success(c, { message: "Comment deleted" });
});
