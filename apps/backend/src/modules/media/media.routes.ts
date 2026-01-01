import { Hono } from "hono";
import { success } from "../../shared/utils";
import { authMiddleware } from "../../shared/middleware";
import { BadRequestError } from "../../shared/errors";
import type { AppEnv } from "../../shared/types";
import * as service from "./media.service";

export const mediaRoutes = new Hono<AppEnv>();

// All routes require authentication
mediaRoutes.use("/*", authMiddleware);

// Map types to specific folders
const UPLOAD_MAP: Record<string, string> = {
  property: "uploads/images/properties",
  short: "uploads/videos/shorts",
  avatar: "uploads/images/avatars",
  chat: "uploads/images/chat",
  default: "uploads",
};

function getUploadFolder(type?: string): string {
  return UPLOAD_MAP[type as keyof typeof UPLOAD_MAP] || UPLOAD_MAP.default;
}

// Upload single file
mediaRoutes.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    console.log("Upload request debug:", {
      fileType: file?.type,
      size: file?.size,
      name: file?.name,
      type,
    });

    if (!file) {
      console.error("No file found in form data");
      throw new BadRequestError("No file provided");
    }

    const folder = getUploadFolder(type);
    const result = await service.uploadFile(file, folder);
    return success(c, result);
  } catch (err) {
    console.error("Upload route error:", err);
    throw err;
  }
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

  const type = body["type"] as string;
  const folder = getUploadFolder(type);

  const results = await service.uploadFiles(files as File[], folder);
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

  // Force chat folder for this specific endpoint
  const results = await service.uploadFiles(files as File[], UPLOAD_MAP.chat);
  // Return in format expected by frontend: { urls: string[] }
  return success(c, { urls: results.map((r) => r.url) });
});

// Delete file
mediaRoutes.delete("/:key", async (c) => {
  const key = c.req.param("key");
  await service.deleteFile(key);
  return success(c, { deleted: true });
});
