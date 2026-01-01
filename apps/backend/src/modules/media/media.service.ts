import { nanoid } from "nanoid";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "../../config/env";
import { BadRequestError } from "../../shared/errors";

// Allowed file types
// Allowed file types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// S3 Client singleton
let s3Client: S3Client | null = null;

// Initialize S3 Client for Cloudflare R2
function getS3Client(): S3Client {
  if (s3Client) {
    return s3Client;
  }

  if (
    !env.CLOUDFLARE_ACCOUNT_ID ||
    !env.R2_ACCESS_KEY_ID ||
    !env.R2_SECRET_ACCESS_KEY
  ) {
    throw new BadRequestError(
      "Cloudflare R2 is not configured. Please set CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env"
    );
  }

  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  return s3Client;
}

/**
 * Upload single file to Cloudflare R2
 */
export async function uploadFile(file: File, folder: string = "uploads") {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new BadRequestError(
      `Invalid file type "${file.type}". Allowed: ${ALLOWED_TYPES.join(", ")}`
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestError(
      `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    );
  }

  // Validate R2 configuration
  if (!env.R2_BUCKET_NAME) {
    throw new BadRequestError("R2_BUCKET_NAME is not configured");
  }

  if (!env.R2_PUBLIC_URL) {
    throw new BadRequestError("R2_PUBLIC_URL is not configured");
  }

  // Generate unique key
  const ext = file.name.split(".").pop() || "jpg";
  // Remove leading/trailing slashes and sanitize to prevent directory traversal
  const cleanFolder = folder
    .replace(/^\/+|\/+$/g, "") // Remove leading/trailing slashes
    .replace(/\.\./g, "") // Remove '..'
    .replace(/\/+/g, "/"); // Collapse multiple slashes
  const key = `${cleanFolder}/${nanoid()}.${ext}`;

  try {
    const client = getS3Client();

    // Upload to R2 using AWS SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await client.send(command);

    console.log("R2 upload successful:", key);

    return {
      key,
      url: `${env.R2_PUBLIC_URL}/${key}`,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error("R2 upload error:", error);
    throw new BadRequestError(
      `Failed to upload file to R2: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(files: File[], folder: string = "uploads") {
  return Promise.all(files.map((file) => uploadFile(file, folder)));
}

/**
 * Delete file from Cloudflare R2
 */
export async function deleteFile(key: string) {
  if (!env.R2_BUCKET_NAME) {
    console.warn("R2_BUCKET_NAME not configured, skipping delete");
    return { deleted: true };
  }

  try {
    const client = getS3Client();

    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
    console.log("R2 delete successful:", key);

    return { deleted: true };
  } catch (error) {
    console.error("R2 delete error:", error);
    // Don't throw on delete errors, just log
    return { deleted: false };
  }
}
