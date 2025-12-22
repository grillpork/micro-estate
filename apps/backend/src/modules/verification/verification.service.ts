import { eq, and, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db";
import {
  agentVerifications,
  agentProfiles,
  emailVerifications,
  users,
  properties,
} from "../../db/schema";
import {
  sendVerificationEmail,
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
} from "../../shared/services/email";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../shared/errors";
import { env } from "../../config/env";
import type {
  BasicVerificationInput,
  IdentityVerificationInput,
  ReviewVerificationInput,
  VerificationLevel,
} from "./verification.schema";
import { LISTING_LIMITS } from "./verification.schema";

// ===== Types =====
export interface AgentProfile {
  id: string;
  userId: string;
  verificationLevel: VerificationLevel;
  maxListings: number;
  fullName: string | null;
  phone: string | null;
  profileImageUrl: string | null;
  emailVerified: Date | null;
  identityVerified: Date | null;
  showBadge: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Get or Create Agent Profile =====
export async function getOrCreateAgentProfile(
  userId: string
): Promise<AgentProfile> {
  let [profile] = await db
    .select()
    .from(agentProfiles)
    .where(eq(agentProfiles.userId, userId));

  if (!profile) {
    // Default: allow 1 listing for unverified users
    const [newProfile] = await db
      .insert(agentProfiles)
      .values({
        id: nanoid(),
        userId,
        verificationLevel: "none",
        maxListings: 1, // Allow 1 listing by default
        showBadge: "false",
      })
      .returning();
    profile = newProfile;
  }

  return profile as AgentProfile;
}

// ===== Request Email Verification =====
export async function requestEmailVerification(
  userId: string,
  email: string
): Promise<{ sent: boolean }> {
  // Get user
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new NotFoundError("User");

  // Create token
  const token = nanoid(64);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete existing verifications for this email
  await db
    .delete(emailVerifications)
    .where(
      and(
        eq(emailVerifications.userId, userId),
        eq(emailVerifications.email, email)
      )
    );

  // Create new verification
  await db.insert(emailVerifications).values({
    id: nanoid(),
    userId,
    email,
    token,
    expiresAt,
  });

  // Send verification email
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const sent = await sendVerificationEmail(
    email,
    user.name || "User",
    verificationUrl
  );

  return { sent };
}

// ===== Verify Email Token =====
export async function verifyEmailToken(
  token: string
): Promise<{ verified: boolean }> {
  const [verification] = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.token, token));

  if (!verification) {
    throw new NotFoundError("Verification token");
  }

  if (verification.expiresAt < new Date()) {
    throw new BadRequestError("Verification token has expired");
  }

  if (verification.verifiedAt) {
    throw new BadRequestError("Email already verified");
  }

  // Mark as verified
  await db
    .update(emailVerifications)
    .set({ verifiedAt: new Date() })
    .where(eq(emailVerifications.id, verification.id));

  // Update agent profile
  await db
    .update(agentProfiles)
    .set({ emailVerified: new Date(), updatedAt: new Date() })
    .where(eq(agentProfiles.userId, verification.userId));

  // Update user email if different
  await db
    .update(users)
    .set({
      email: verification.email,
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, verification.userId));

  return { verified: true };
}

// ===== Submit Basic Verification =====
export async function submitBasicVerification(
  userId: string,
  input: BasicVerificationInput
): Promise<void> {
  // Get or create profile
  const profile = await getOrCreateAgentProfile(userId);

  // Check if already basic verified
  if (profile.verificationLevel !== "none") {
    throw new ConflictError("You already have basic verification or higher");
  }

  // Check email verification
  if (!profile.emailVerified) {
    throw new BadRequestError("Please verify your email first");
  }

  // Check for pending verification
  const [pending] = await db
    .select()
    .from(agentVerifications)
    .where(
      and(
        eq(agentVerifications.userId, userId),
        eq(agentVerifications.status, "pending")
      )
    );

  if (pending) {
    throw new ConflictError("You already have a pending verification request");
  }

  // Create verification request
  await db.insert(agentVerifications).values({
    id: nanoid(),
    userId,
    level: "basic",
    fullName: input.fullName,
    phone: input.phone,
    profileImageUrl: input.profileImageUrl,
    status: "pending",
  });

  // Auto-approve basic verification (no admin review needed)
  await approveBasicVerification(userId, input);
}

// ===== Auto-approve Basic Verification =====
async function approveBasicVerification(
  userId: string,
  input: BasicVerificationInput
): Promise<void> {
  // Update profile
  await db
    .update(agentProfiles)
    .set({
      verificationLevel: "basic",
      maxListings: LISTING_LIMITS.basic,
      fullName: input.fullName,
      phone: input.phone,
      profileImageUrl: input.profileImageUrl,
      showBadge: "false", // No badge for basic
      updatedAt: new Date(),
    })
    .where(eq(agentProfiles.userId, userId));

  // Update user role to agent
  await db
    .update(users)
    .set({
      role: "agent",
      name: input.fullName,
      phone: input.phone,
      image: input.profileImageUrl,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Update verification status
  await db
    .update(agentVerifications)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(
      and(
        eq(agentVerifications.userId, userId),
        eq(agentVerifications.level, "basic")
      )
    );

  // Send email
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.email) {
    await sendVerificationApprovedEmail(
      user.email,
      user.name || "User",
      "basic"
    );
  }
}

// ===== Submit Identity Verification =====
export async function submitIdentityVerification(
  userId: string,
  input: IdentityVerificationInput
): Promise<void> {
  const profile = await getOrCreateAgentProfile(userId);

  // Check if already identity verified
  if (profile.verificationLevel === "identity") {
    throw new ConflictError("You already have identity verification");
  }

  // Must have basic verification first
  if (profile.verificationLevel !== "basic") {
    throw new BadRequestError("Please complete basic verification first");
  }

  // Check for pending verification
  const [pending] = await db
    .select()
    .from(agentVerifications)
    .where(
      and(
        eq(agentVerifications.userId, userId),
        eq(agentVerifications.level, "identity"),
        eq(agentVerifications.status, "pending")
      )
    );

  if (pending) {
    throw new ConflictError(
      "You already have a pending identity verification request"
    );
  }

  // Create verification request
  await db.insert(agentVerifications).values({
    id: nanoid(),
    userId,
    level: "identity",
    idCardFrontUrl: input.idCardFrontUrl,
    idCardBackUrl: input.idCardBackUrl,
    idCardName: input.idCardName,
    status: "pending",
  });
}

// ===== Admin: Get Pending Verifications =====
export async function getPendingVerifications(level?: VerificationLevel) {
  let query = db
    .select({
      verification: agentVerifications,
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
      },
    })
    .from(agentVerifications)
    .innerJoin(users, eq(agentVerifications.userId, users.id))
    .where(eq(agentVerifications.status, "pending"))
    .orderBy(desc(agentVerifications.createdAt));

  const results = await query;

  if (level) {
    return results.filter((r) => r.verification.level === level);
  }

  return results;
}

// ===== Admin: Review Verification =====
export async function reviewVerification(
  verificationId: string,
  adminId: string,
  input: ReviewVerificationInput
): Promise<void> {
  const [verification] = await db
    .select()
    .from(agentVerifications)
    .where(eq(agentVerifications.id, verificationId));

  if (!verification) {
    throw new NotFoundError("Verification");
  }

  if (verification.status !== "pending") {
    throw new BadRequestError("This verification has already been reviewed");
  }

  if (input.status === "approved") {
    // Approve
    await db
      .update(agentVerifications)
      .set({
        status: "approved",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentVerifications.id, verificationId));

    // Update profile based on level
    const level = verification.level as VerificationLevel;

    await db
      .update(agentProfiles)
      .set({
        verificationLevel: level,
        maxListings: LISTING_LIMITS[level],
        identityVerified: level === "identity" ? new Date() : undefined,
        showBadge: level === "identity" ? "verified" : "false",
        updatedAt: new Date(),
      })
      .where(eq(agentProfiles.userId, verification.userId));

    // Send approval email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, verification.userId));
    if (user?.email) {
      await sendVerificationApprovedEmail(
        user.email,
        user.name || "User",
        level as "basic" | "identity"
      );
    }
  } else {
    // Reject
    await db
      .update(agentVerifications)
      .set({
        status: "rejected",
        rejectionReason: input.rejectionReason,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentVerifications.id, verificationId));

    // Send rejection email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, verification.userId));
    if (user?.email) {
      await sendVerificationRejectedEmail(
        user.email,
        user.name || "User",
        input.rejectionReason || "ไม่ระบุเหตุผล"
      );
    }
  }
}

// ===== Get Verification Status =====
export async function getVerificationStatus(userId: string) {
  const profile = await getOrCreateAgentProfile(userId);

  const [latestVerification] = await db
    .select()
    .from(agentVerifications)
    .where(eq(agentVerifications.userId, userId))
    .orderBy(desc(agentVerifications.createdAt))
    .limit(1);

  // Get current listing count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(eq(properties.userId, userId));

  return {
    verificationLevel: profile.verificationLevel,
    maxListings: profile.maxListings,
    currentListings: Number(count),
    canCreateListing: Number(count) < profile.maxListings,
    emailVerified: !!profile.emailVerified,
    identityVerified: !!profile.identityVerified,
    showBadge: profile.showBadge,
    latestRequest: latestVerification
      ? {
          id: latestVerification.id,
          level: latestVerification.level,
          status: latestVerification.status,
          rejectionReason: latestVerification.rejectionReason,
          createdAt: latestVerification.createdAt,
        }
      : null,
  };
}

// ===== Check Can Create Listing =====
export async function canCreateListing(userId: string): Promise<boolean> {
  const profile = await getOrCreateAgentProfile(userId);

  // Get current listing count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(eq(properties.userId, userId));

  const currentCount = Number(count);

  // Default: allow 1 listing for unverified users
  const effectiveMaxListings =
    profile.maxListings === 0 ? 1 : profile.maxListings;

  return currentCount < effectiveMaxListings;
}
