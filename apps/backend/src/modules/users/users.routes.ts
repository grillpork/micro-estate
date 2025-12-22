import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { success } from "../../shared/utils";
import { idParamSchema } from "../../shared/schemas";
import { authMiddleware, adminOnly } from "../../shared/middleware";
import { NotFoundError } from "../../shared/errors";
import type { AppEnv } from "../../shared/types";
import * as service from "./users.service";
import { updateUserSchema } from "./users.schema";

export const usersRoutes = new Hono<AppEnv>();

// All routes require authentication
usersRoutes.use("/*", authMiddleware);

// Get current user profile
usersRoutes.get("/me", async (c) => {
  const user = c.get("user");
  return success(c, user);
});

// Update current user profile
usersRoutes.put("/me", zValidator("json", updateUserSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");
  const updated = await service.updateUser(user.id, body);
  return success(c, updated);
});

// Upload profile image
usersRoutes.post("/profile-image", async (c) => {
  const user = c.get("user");
  const body = await c.req.parseBody();
  const file = body["file"] as File;

  if (!file) {
    throw new NotFoundError("No file provided");
  }

  const result = await service.updateProfileImage(user.id, file);
  return success(c, result);
});

// Search users by name or email (for chat)
const searchQuerySchema = z.object({
  q: z.string().min(2, "Search query must be at least 2 characters"),
});

usersRoutes.get(
  "/search",
  zValidator("query", searchQuerySchema),
  async (c) => {
    const user = c.get("user");
    const { q } = c.req.valid("query");
    const results = await service.searchUsers(q, user.id);
    return success(c, results);
  }
);

// Get user public profile (for chat - returns limited info)
usersRoutes.get(
  "/profile/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = await service.getUserById(id);
    if (!user) throw new NotFoundError("User");

    // Return only public information
    return success(c, {
      id: user.id,
      name: user.name,
      image: user.image,
      role: user.role,
    });
  }
);

// Admin: Get all users
usersRoutes.get("/", adminOnly, async (c) => {
  const users = await service.getUsers();
  return success(c, users);
});

// Admin: Get user by ID
usersRoutes.get(
  "/:id",
  adminOnly,
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = await service.getUserById(id);
    if (!user) throw new NotFoundError("User");
    return success(c, user);
  }
);

// Admin: Update user
usersRoutes.put(
  "/:id",
  adminOnly,
  zValidator("param", idParamSchema),
  zValidator("json", updateUserSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const user = await service.updateUser(id, body);
    return success(c, user);
  }
);

// Admin: Delete user
usersRoutes.delete(
  "/:id",
  adminOnly,
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    await service.deleteUser(id);
    return success(c, { deleted: true });
  }
);
