import { Hono } from "hono";
import { success } from "../../shared/utils";
import { authMiddleware } from "../../shared/middleware";
import { BadRequestError } from "../../shared/errors";
import type { AppEnv } from "../../shared/types";
import * as service from "./media.service";

export const mediaRoutes = new Hono<AppEnv>();

// All routes require authentication
mediaRoutes.use("/*", authMiddleware);

// Upload single file
mediaRoutes.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"] as File;

  if (!file) {
    throw new BadRequestError("No file provided");
  }

  const result = await service.uploadFile(file);
  return success(c, result);
});

// Upload multiple files
mediaRoutes.post("/upload/multiple", async (c) => {
  const body = await c.req.parseBody({ all: true });

  // Handle both 'files' and 'files[]' key names
  let files = body["files"] || body["files[]"];

  // Ensure files is an array
  if (files && !Array.isArray(files)) {
    files = [files];
  }

  if (!files || (files as File[]).length === 0) {
    throw new BadRequestError("No files provided");
  }

  const results = await service.uploadFiles(files as File[]);
  return success(c, results);
});

// Upload chat images (returns urls array)
mediaRoutes.post("/upload/chat", async (c) => {
  const body = await c.req.parseBody({ all: true });

  // Handle both 'files' and 'files[]' key names
  let files = body["files"] || body["files[]"];

  // Ensure files is an array
  if (files && !Array.isArray(files)) {
    files = [files];
  }

  if (!files || (files as File[]).length === 0) {
    throw new BadRequestError("No files provided");
  }

  const results = await service.uploadFiles(files as File[]);
  // Return in format expected by frontend: { urls: string[] }
  return success(c, { urls: results.map((r) => r.url) });
});

// Delete file
mediaRoutes.delete("/:key", async (c) => {
  const key = c.req.param("key");
  await service.deleteFile(key);
  return success(c, { deleted: true });
});
