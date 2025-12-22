import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as crypto from "crypto";
import { db } from "../../db";
import { properties, propertyEmbeddings } from "../../db/schema";
import { generateEmbedding } from "../../shared/services/rag.client";

/**
 * Build searchable text from property data for embedding generation
 */
function buildPropertySearchableText(property: {
  title: string;
  description: string | null;
  propertyType: string;
  listingType: string;
  price: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string | null;
  province: string | null;
  district: string | null;
  address: string | null;
  features: string | null;
  amenities: string | null;
}): string {
  const parts = [
    // Listing type (Thai + English for better matching)
    property.listingType === "sale" ? "ขาย sale" : "เช่า rent",
    // Property type
    property.propertyType,
    getPropertyTypeThai(property.propertyType),
    // Title and description
    property.title,
    property.description,
    // Location
    property.province,
    property.district,
    property.address,
    // Price range context
    `ราคา ${formatPrice(property.price)}`,
    // Specs
    property.bedrooms ? `${property.bedrooms} ห้องนอน bedroom` : null,
    property.bathrooms ? `${property.bathrooms} ห้องน้ำ bathroom` : null,
    property.area ? `${property.area} ตารางเมตร sqm` : null,
    // Features (parse JSON if exists)
    property.features ? parseJsonToText(property.features) : null,
    // Amenities (parse JSON if exists)
    property.amenities ? parseJsonToText(property.amenities) : null,
  ].filter(Boolean);

  return parts.join(" ");
}

/**
 * Get Thai name for property type
 */
function getPropertyTypeThai(type: string): string {
  const mapping: Record<string, string> = {
    condo: "คอนโด คอนโดมิเนียม",
    house: "บ้าน บ้านเดี่ยว",
    townhouse: "ทาวน์เฮ้าส์ ทาวน์โฮม",
    land: "ที่ดิน",
    commercial: "อาคารพาณิชย์ พื้นที่เชิงพาณิชย์",
    apartment: "อพาร์ทเมนท์",
  };
  return mapping[type] || type;
}

/**
 * Format price for text
 */
function formatPrice(price: string): string {
  const num = Number(price);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} ล้านบาท`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)} พันบาท`;
  }
  return `${num} บาท`;
}

/**
 * Parse JSON string to text
 */
function parseJsonToText(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed.join(" ");
    }
    if (typeof parsed === "object") {
      return Object.values(parsed).flat().join(" ");
    }
    return String(parsed);
  } catch {
    return jsonString;
  }
}

/**
 * Generate content hash for cache invalidation
 */
function generateContentHash(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}

/**
 * Create or update property embedding
 */
export async function createPropertyEmbedding(
  propertyId: string
): Promise<boolean> {
  try {
    // Get property data
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!property) {
      console.error(`Property not found: ${propertyId}`);
      return false;
    }

    // Build searchable text
    const searchableText = buildPropertySearchableText(property);
    const contentHash = generateContentHash(searchableText);

    // Check if embedding already exists and is up-to-date
    const [existing] = await db
      .select()
      .from(propertyEmbeddings)
      .where(eq(propertyEmbeddings.propertyId, propertyId))
      .limit(1);

    if (existing && existing.contentHash === contentHash) {
      console.log(`Embedding already up-to-date for property: ${propertyId}`);
      return true;
    }

    // Generate embedding via RAG service
    console.log(`Generating embedding for property: ${propertyId}`);
    const embedding = await generateEmbedding(searchableText);

    if (!embedding) {
      console.error(`Failed to generate embedding for property: ${propertyId}`);
      return false;
    }

    // Store as JSON string
    const embeddingJson = JSON.stringify(embedding);

    if (existing) {
      // Update existing embedding
      await db
        .update(propertyEmbeddings)
        .set({
          embedding: embeddingJson,
          contentHash,
          updatedAt: new Date(),
        })
        .where(eq(propertyEmbeddings.propertyId, propertyId));

      console.log(`Updated embedding for property: ${propertyId}`);
    } else {
      // Create new embedding
      await db.insert(propertyEmbeddings).values({
        id: nanoid(),
        propertyId,
        embedding: embeddingJson,
        contentHash,
        model: "text-embedding-004",
      });

      console.log(`Created embedding for property: ${propertyId}`);
    }

    return true;
  } catch (error) {
    console.error(`Error creating property embedding: ${error}`);
    return false;
  }
}

/**
 * Delete property embedding
 */
export async function deletePropertyEmbedding(
  propertyId: string
): Promise<void> {
  await db
    .delete(propertyEmbeddings)
    .where(eq(propertyEmbeddings.propertyId, propertyId));
}

/**
 * Batch create embeddings for all active properties without embeddings
 */
export async function syncPropertyEmbeddings(): Promise<{
  success: number;
  failed: number;
}> {
  // Get active properties without embeddings
  const activeProperties = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.status, "active"));

  const existingEmbeddings = await db
    .select({ propertyId: propertyEmbeddings.propertyId })
    .from(propertyEmbeddings);

  const existingIds = new Set(existingEmbeddings.map((e) => e.propertyId));
  const missingProperties = activeProperties.filter(
    (p) => !existingIds.has(p.id)
  );

  console.log(
    `Syncing embeddings for ${missingProperties.length} properties...`
  );

  let success = 0;
  let failed = 0;

  for (const property of missingProperties) {
    const result = await createPropertyEmbedding(property.id);
    if (result) {
      success++;
    } else {
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`Sync complete: ${success} success, ${failed} failed`);

  return { success, failed };
}
