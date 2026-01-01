import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { shortsService } from "./shorts.service";
import { authMiddleware } from "../../shared/middleware";
import { success, created } from "../../shared/utils";
import { AppEnv } from "../../shared/types";

export const shortsRoutes = new Hono<AppEnv>();

const createShortSchema = z.object({
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  description: z.string().optional(),
});

const commentSchema = z.object({
  content: z.string().min(1),
});

// GET /shorts/feed
shortsRoutes.get("/feed", authMiddleware, async (c) => {
  const user = c.get("user");
  const limit = Number(c.req.query("limit")) || 10;
  const offset = Number(c.req.query("offset")) || 0;

  const videos = await shortsService.getFeed(user?.id, limit, offset);
  return success(c, videos);
});

// POST /shorts
shortsRoutes.post(
  "/",
  authMiddleware,
  zValidator("json", createShortSchema, (result, c) => {
    if (!result.success) {
      console.error("Shorts validation error:", result.error);
      return c.json({ error: result.error, success: false }, 400);
    }
  }),
  async (c) => {
    const user = c.get("user");
    const { videoUrl, thumbnailUrl, description } = c.req.valid("json");

    const video = await shortsService.createShort(
      user.id,
      videoUrl,
      description,
      thumbnailUrl
    );
    return created(c, video);
  }
);

// DELETE /shorts/:id
shortsRoutes.delete("/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  await shortsService.deleteShort(id, user.id);
  return success(c, { message: "Deleted successfully" });
});

// POST /shorts/:id/like
shortsRoutes.post("/:id/like", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const result = await shortsService.toggleLike(id, user.id);
  return success(c, result);
});

// POST /shorts/follow/:userId
shortsRoutes.post("/follow/:userId", authMiddleware, async (c) => {
  const user = c.get("user");
  const followingId = c.req.param("userId");

  const result = await shortsService.toggleFollow(user.id, followingId);
  return success(c, result);
});

// GET /shorts/:id/comments
shortsRoutes.get("/:id/comments", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const comments = await shortsService.getComments(id);
  return success(c, comments);
});

// POST /shorts/:id/comments
shortsRoutes.post(
  "/:id/comments",
  authMiddleware,
  zValidator("json", commentSchema),
  async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { content } = c.req.valid("json");

    const comment = await shortsService.addComment(id, user.id, content);
    return created(c, comment);
  }
);
