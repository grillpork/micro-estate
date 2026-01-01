import {
  pgTable,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { properties } from "./properties";

// ===== Enums (use values from shared constants) =====
export const demandIntentEnum = pgEnum("demand_intent", ["buy", "rent"]);

export const demandUrgencyEnum = pgEnum("demand_urgency", [
  "urgent",
  "normal",
  "not_rush",
]);

export const demandStatusEnum = pgEnum("demand_status", [
  "active",
  "matched",
  "closed",
  "expired",
]);

// ===== Demand Posts Table =====
export const demandPosts = pgTable("demand_posts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Intent & Type (from shared constants)
  intent: demandIntentEnum("intent").notNull(), // buy / rent
  propertyType: text("property_type").notNull(), // uses PROPERTY_TYPE values

  // Budget
  budgetMin: numeric("budget_min", { precision: 15, scale: 2 }),
  budgetMax: numeric("budget_max", { precision: 15, scale: 2 }),

  // Location
  province: text("province"),
  district: text("district"),
  subDistrict: text("sub_district"),
  nearBts: text("near_bts"), // ชื่อสถานี BTS (optional)
  nearMrt: text("near_mrt"), // ชื่อสถานี MRT (optional)

  // Requirements
  bedroomsMin: integer("bedrooms_min"),
  bedroomsMax: integer("bedrooms_max"),
  bathroomsMin: integer("bathrooms_min"),
  areaMin: numeric("area_min", { precision: 10, scale: 2 }),
  areaMax: numeric("area_max", { precision: 10, scale: 2 }),

  // Free-text (for AI to process later)
  description: text("description"), // รายละเอียดเพิ่มเติมที่ user พิมพ์

  // AI-Generated fields (Phase 2)
  summary: text("summary"), // AI-generated summary
  tags: text("tags"), // JSON array of tags
  readinessScore: integer("readiness_score"), // 1-100 (AI ประเมินความพร้อม)

  // Settings
  urgency: demandUrgencyEnum("urgency").notNull().default("normal"),
  isPublic: boolean("is_public").notNull().default(true),
  maxAgents: integer("max_agents").notNull().default(5),

  // Status
  status: demandStatusEnum("status").notNull().default("active"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"), // auto-calculated from DEMAND_LIMITS.EXPIRY_DAYS
});

// ===== Demand Matches Table =====
// Stores matched properties for each demand
export const demandMatches = pgTable("demand_matches", {
  id: text("id").primaryKey(),
  demandId: text("demand_id")
    .notNull()
    .references(() => demandPosts.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),

  matchScore: integer("match_score"), // 1-100 (ความตรงกัน)
  matchedAt: timestamp("matched_at").notNull().defaultNow(),

  // User actions
  isViewed: boolean("is_viewed").notNull().default(false),
  isSaved: boolean("is_saved").notNull().default(false),
  isContacted: boolean("is_contacted").notNull().default(false),
});

// ===== Relations =====
export const demandPostsRelations = relations(demandPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [demandPosts.userId],
    references: [users.id],
  }),
  matches: many(demandMatches),
}));

export const demandMatchesRelations = relations(demandMatches, ({ one }) => ({
  demand: one(demandPosts, {
    fields: [demandMatches.demandId],
    references: [demandPosts.id],
  }),
  property: one(properties, {
    fields: [demandMatches.propertyId],
    references: [properties.id],
  }),
}));
