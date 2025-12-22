import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { success } from "../../shared/utils";
import { authMiddleware, adminOnly } from "../../shared/middleware";
import { idParamSchema } from "../../shared/schemas";
import type { AppEnv } from "../../shared/types";
import * as service from "./verification.service";
import {
  basicVerificationSchema,
  identityVerificationSchema,
  requestEmailVerificationSchema,
  verifyEmailSchema,
  reviewVerificationSchema,
} from "./verification.schema";

export const verificationRoutes = new Hono<AppEnv>();

// ===== Public Routes =====

// Verify email token (public - accessed via email link)
verificationRoutes.post(
  "/email/verify",
  zValidator("json", verifyEmailSchema),
  async (c) => {
    const { token } = c.req.valid("json");
    const result = await service.verifyEmailToken(token);
    return success(c, result);
  }
);

// ===== Protected Routes =====
verificationRoutes.use("/*", authMiddleware);

// Get verification status
verificationRoutes.get("/status", async (c) => {
  const user = c.get("user");
  const status = await service.getVerificationStatus(user.id);
  return success(c, status);
});

// Request email verification
verificationRoutes.post(
  "/email/request",
  zValidator("json", requestEmailVerificationSchema),
  async (c) => {
    const user = c.get("user");
    const { email } = c.req.valid("json");
    const result = await service.requestEmailVerification(user.id, email);
    return success(c, result);
  }
);

// Submit basic verification
verificationRoutes.post(
  "/basic",
  zValidator("json", basicVerificationSchema),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");
    await service.submitBasicVerification(user.id, body);
    return success(c, { submitted: true });
  }
);

// Submit identity verification
verificationRoutes.post(
  "/identity",
  zValidator("json", identityVerificationSchema),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");
    await service.submitIdentityVerification(user.id, body);
    return success(c, { submitted: true });
  }
);

// ===== Admin Routes =====

// Get pending verifications
verificationRoutes.get("/admin/pending", adminOnly, async (c) => {
  const level = c.req.query("level") as "basic" | "identity" | undefined;
  const verifications = await service.getPendingVerifications(level);
  return success(c, verifications);
});

// Review verification
verificationRoutes.post(
  "/admin/:id/review",
  adminOnly,
  zValidator("param", idParamSchema),
  zValidator("json", reviewVerificationSchema),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    await service.reviewVerification(id, user.id, body);
    return success(c, { reviewed: true });
  }
);
