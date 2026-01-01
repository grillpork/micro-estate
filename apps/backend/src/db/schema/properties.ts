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

// ===== Enums =====
export const propertyStatusEnum = pgEnum("property_status", [
  "draft",
  "active",
  "pending",
  "rejected",
  "sold",
  "rented",
  "inactive",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "house",
  "condo",
  "townhouse",
  "land",
  "commercial",
  "apartment",
]);

export const listingTypeEnum = pgEnum("listing_type", ["sale", "rent"]);

// ===== Properties Table =====
export const properties = pgTable("properties", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Basic Info
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),

  // Type & Status
  propertyType: propertyTypeEnum("property_type").notNull(),
  listingType: listingTypeEnum("listing_type").notNull(),
  status: propertyStatusEnum("status").notNull().default("draft"),

  // Pricing
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  pricePerSqm: numeric("price_per_sqm", { precision: 15, scale: 2 }),

  // Details
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  area: numeric("area", { precision: 10, scale: 2 }),
  landArea: numeric("land_area", { precision: 10, scale: 2 }),
  floors: integer("floors"),
  yearBuilt: integer("year_built"),

  // Location
  address: text("address"),
  subDistrict: text("sub_district"),
  district: text("district"),
  province: text("province"),
  postalCode: text("postal_code"),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),

  // Features
  features: text("features"), // JSON string
  amenities: text("amenities"), // JSON string

  // Media
  thumbnailUrl: text("thumbnail_url"),

  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),

  // Stats
  views: integer("views").notNull().default(0),
  favorites: integer("favorites").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),

  // Admin
  rejectionReason: text("rejection_reason"),

  // Timestamps
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ===== Property Images =====
export const propertyImages = pgTable("property_images", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ===== Favorites =====
export const favorites = pgTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ===== Relations =====
// Note: propertyAmenities relation is defined in amenities.ts to avoid circular imports
export const propertiesRelations = relations(properties, ({ one, many }) => ({
  user: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
  images: many(propertyImages),
  // propertyAmenities defined in amenities.ts
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [favorites.propertyId],
    references: [properties.id],
  }),
}));
