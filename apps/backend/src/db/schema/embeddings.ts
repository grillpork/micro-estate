import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { demandPosts } from "./demands";
import { properties } from "./properties";

// Note: pgvector extension must be enabled in Neon
// Run: CREATE EXTENSION IF NOT EXISTS vector;

// Gemini text-embedding-004 produces 768-dimensional vectors
const EMBEDDING_DIMENSION = 768;

// ===== Demand Embeddings =====
// Stores vector embeddings for demand posts for semantic matching
export const demandEmbeddings = pgTable(
  "demand_embeddings",
  {
    id: text("id").primaryKey(),
    demandId: text("demand_id")
      .notNull()
      .references(() => demandPosts.id, { onDelete: "cascade" })
      .unique(),

    // Vector embedding (Gemini text-embedding-004 = 768 dimensions)
    // Using raw SQL for vector type as Drizzle doesn't have native support
    embedding: text("embedding").notNull(), // stored as JSON string of number[]

    // Metadata for cache invalidation
    contentHash: text("content_hash").notNull(), // hash of demand content
    model: text("model").notNull().default("text-embedding-004"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    // Index for fast lookup by demandId
    demandIdIdx: index("demand_embeddings_demand_id_idx").on(table.demandId),
  })
);

// ===== Property Embeddings =====
// Stores vector embeddings for properties for semantic matching with demands
export const propertyEmbeddings = pgTable(
  "property_embeddings",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" })
      .unique(),

    // Vector embedding
    embedding: text("embedding").notNull(), // stored as JSON string of number[]

    // Metadata
    contentHash: text("content_hash").notNull(),
    model: text("model").notNull().default("text-embedding-004"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    propertyIdIdx: index("property_embeddings_property_id_idx").on(
      table.propertyId
    ),
  })
);

// ===== Relations =====
export const demandEmbeddingsRelations = relations(
  demandEmbeddings,
  ({ one }) => ({
    demand: one(demandPosts, {
      fields: [demandEmbeddings.demandId],
      references: [demandPosts.id],
    }),
  })
);

export const propertyEmbeddingsRelations = relations(
  propertyEmbeddings,
  ({ one }) => ({
    property: one(properties, {
      fields: [propertyEmbeddings.propertyId],
      references: [properties.id],
    }),
  })
);
