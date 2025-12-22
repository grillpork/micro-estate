import { z } from "zod";

// ===== Basic Verification Schema =====
export const basicVerificationSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(9).max(15),
  profileImageUrl: z.string().url(),
});

// ===== Identity Verification Schema =====
export const identityVerificationSchema = z.object({
  idCardFrontUrl: z.string().url(),
  idCardBackUrl: z.string().url(),
  idCardName: z.string().min(2).max(100), // Name on ID card
});

// ===== Email Verification Schema =====
export const requestEmailVerificationSchema = z.object({
  email: z.string().email(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(32),
});

// ===== Admin Review Schema =====
export const reviewVerificationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().max(500).optional(),
});

// ===== Types =====
export type BasicVerificationInput = z.infer<typeof basicVerificationSchema>;
export type IdentityVerificationInput = z.infer<
  typeof identityVerificationSchema
>;
export type ReviewVerificationInput = z.infer<typeof reviewVerificationSchema>;

// ===== Verification Levels =====
export const VERIFICATION_LEVELS = {
  NONE: "none",
  BASIC: "basic",
  IDENTITY: "identity",
} as const;

export type VerificationLevel =
  (typeof VERIFICATION_LEVELS)[keyof typeof VERIFICATION_LEVELS];

// ===== Listing Limits =====
export const LISTING_LIMITS = {
  none: 0,
  basic: 1,
  identity: 999, // Effectively unlimited
} as const;
