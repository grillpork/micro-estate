import { pgTable, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

// ===== Verification Status Enum =====
export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "approved",
  "rejected",
]);

export const verificationLevelEnum = pgEnum("verification_level", [
  "none",
  "basic",
  "identity",
]);

// ===== Agent Verification Table =====
export const agentVerifications = pgTable("agent_verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Level being requested
  level: verificationLevelEnum("level").notNull(),

  // Basic Verification Fields
  fullName: text("full_name"),
  phone: text("phone"),
  profileImageUrl: text("profile_image_url"),

  // Identity Verification Fields
  idCardFrontUrl: text("id_card_front_url"),
  idCardBackUrl: text("id_card_back_url"),
  idCardName: text("id_card_name"), // Name on ID card

  // Status
  status: verificationStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ===== Email Verifications Table =====
export const emailVerifications = pgTable("email_verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ===== Agent Profiles Table =====
export const agentProfiles = pgTable("agent_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // Verification Level
  verificationLevel: verificationLevelEnum("verification_level")
    .notNull()
    .default("none"),

  // Limits based on verification
  maxListings: integer("max_listings").notNull().default(0),

  // Basic info
  fullName: text("full_name"),
  phone: text("phone"),
  profileImageUrl: text("profile_image_url"),

  // Email verification
  emailVerified: timestamp("email_verified"),

  // Identity verification
  identityVerified: timestamp("identity_verified"),

  // Display
  showBadge: text("show_badge").notNull().default("false"), // 'false', 'basic', 'verified'

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ===== Relations =====
export const agentVerificationsRelations = relations(
  agentVerifications,
  ({ one }) => ({
    user: one(users, {
      fields: [agentVerifications.userId],
      references: [users.id],
    }),
    reviewer: one(users, {
      fields: [agentVerifications.reviewedBy],
      references: [users.id],
      relationName: "reviewer",
    }),
  })
);

export const agentProfilesRelations = relations(agentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [agentProfiles.userId],
    references: [users.id],
  }),
}));

export const emailVerificationsRelations = relations(
  emailVerifications,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerifications.userId],
      references: [users.id],
    }),
  })
);
