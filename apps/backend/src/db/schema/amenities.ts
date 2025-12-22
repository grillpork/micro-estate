import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { properties } from "./properties";

// ===== Amenity Category Enum =====
export const amenityCategoryEnum = pgEnum("amenity_category", [
  "general", // ทั่วไป
  "security", // ความปลอดภัย
  "recreation", // สันทนาการ
  "convenience", // ความสะดวก
  "parking", // ที่จอดรถ
  "wellness", // สุขภาพ/ความเป็นอยู่
  "outdoor", // พื้นที่ภายนอก
  "utilities", // สาธารณูปโภค
]);

// ===== Master Amenities Table =====
export const amenities = pgTable("amenities", {
  id: text("id").primaryKey(),

  // Basic info
  name: text("name").notNull().unique(), // English name (unique identifier)
  nameTh: text("name_th"), // Thai name for display
  description: text("description"), // Optional description
  descriptionTh: text("description_th"), // Thai description

  // Categorization & Display
  category: amenityCategoryEnum("category").notNull(),
  icon: text("icon"), // Icon name (e.g., "pool", "gym") or URL
  order: integer("order").notNull().default(0), // Display order within category

  // Status
  isActive: boolean("is_active").notNull().default(true),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ===== Property Amenities Junction Table =====
export const propertyAmenities = pgTable(
  "property_amenities",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    amenityId: text("amenity_id")
      .notNull()
      .references(() => amenities.id, { onDelete: "cascade" }),

    // Optional extra info
    note: text("note"), // e.g., "เปิด 6:00-22:00", "ชั้น 3"

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    // Ensure unique property-amenity combination
    uniquePropertyAmenity: unique().on(table.propertyId, table.amenityId),
  })
);

// ===== Relations =====
export const amenitiesRelations = relations(amenities, ({ many }) => ({
  propertyAmenities: many(propertyAmenities),
}));

export const propertyAmenitiesRelations = relations(
  propertyAmenities,
  ({ one }) => ({
    property: one(properties, {
      fields: [propertyAmenities.propertyId],
      references: [properties.id],
    }),
    amenity: one(amenities, {
      fields: [propertyAmenities.amenityId],
      references: [amenities.id],
    }),
  })
);

// ===== Type Exports =====
export type Amenity = typeof amenities.$inferSelect;
export type NewAmenity = typeof amenities.$inferInsert;
export type PropertyAmenity = typeof propertyAmenities.$inferSelect;
export type NewPropertyAmenity = typeof propertyAmenities.$inferInsert;
export type AmenityCategory = (typeof amenityCategoryEnum.enumValues)[number];
