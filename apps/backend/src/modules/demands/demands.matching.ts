import { eq, and, sql, gte, lte, or, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db";
import {
  demandPosts,
  demandMatches,
  demandEmbeddings,
  properties,
  propertyEmbeddings,
} from "../../db/schema";
import { DEMAND_STATUS, PROPERTY_STATUS } from "../../shared/constants";
import { calculateSimilarity } from "../../shared/services/rag.client";

// ===== Types =====
export interface MatchResult {
  propertyId: string;
  matchScore: number;
  matchReasons: string[];
}

export interface DemandMatchInput {
  demandId: string;
  limit?: number;
}

// ===== Constants =====
const DEFAULT_MATCH_LIMIT = 10;
const MIN_SIMILARITY_THRESHOLD = 0.6; // 60% similarity minimum
const EXACT_MATCH_BONUS = 20; // Bonus for exact matches
const RANGE_MATCH_BONUS = 10; // Bonus for range matches

// ===== Match Demand with Properties =====
export async function matchDemandWithProperties(
  input: DemandMatchInput
): Promise<MatchResult[]> {
  const { demandId, limit = DEFAULT_MATCH_LIMIT } = input;

  // Get demand details
  const [demand] = await db
    .select()
    .from(demandPosts)
    .where(eq(demandPosts.id, demandId))
    .limit(1);

  if (!demand) {
    throw new Error("Demand not found");
  }

  // Build filter conditions for structured matching
  const conditions = [
    eq(properties.status, PROPERTY_STATUS.ACTIVE as any),
    eq(properties.listingType, demand.intent === "buy" ? "sale" : "rent"),
    eq(properties.propertyType, demand.propertyType as any),
  ];

  // Location filters (optional)
  if (demand.province) {
    conditions.push(eq(properties.province, demand.province));
  }

  // Budget filters
  if (demand.budgetMin) {
    conditions.push(gte(properties.price, demand.budgetMin));
  }
  if (demand.budgetMax) {
    conditions.push(lte(properties.price, demand.budgetMax));
  }

  // Room filters
  if (demand.bedroomsMin) {
    conditions.push(gte(properties.bedrooms, demand.bedroomsMin));
  }

  // Get matching properties with structured filters
  const matchingProperties = await db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.createdAt))
    .limit(limit * 2); // Get more for ranking

  if (matchingProperties.length === 0) {
    return [];
  }

  // Calculate match scores
  const results: MatchResult[] = [];

  for (const property of matchingProperties) {
    const { score, reasons } = calculateMatchScore(demand, property);

    if (score >= 50) {
      // Minimum 50% match
      results.push({
        propertyId: property.id,
        matchScore: score,
        matchReasons: reasons,
      });
    }
  }

  // Sort by score and limit
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results.slice(0, limit);
}

// ===== Calculate Match Score =====
function calculateMatchScore(
  demand: typeof demandPosts.$inferSelect,
  property: typeof properties.$inferSelect
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const maxScore = 100;

  // Intent match (required, already filtered)
  score += 20;
  reasons.push("ประเภทตรงกัน");

  // Property type match (required, already filtered)
  score += 20;
  reasons.push(`${property.propertyType} ตรงกับที่ต้องการ`);

  // Budget match
  const propertyPrice = Number(property.price);
  const budgetMin = demand.budgetMin ? Number(demand.budgetMin) : 0;
  const budgetMax = demand.budgetMax ? Number(demand.budgetMax) : Infinity;

  if (propertyPrice >= budgetMin && propertyPrice <= budgetMax) {
    score += 20;
    reasons.push("ราคาอยู่ในงบประมาณ");
  } else if (propertyPrice <= budgetMax * 1.1) {
    // Within 10% over budget
    score += 10;
    reasons.push("ราคาใกล้เคียงงบ");
  }

  // Location match
  if (demand.province && property.province === demand.province) {
    score += 15;
    reasons.push(`จังหวัด ${property.province} ตรงกัน`);
  }
  if (demand.district && property.district === demand.district) {
    score += 10;
    reasons.push(`เขต/อำเภอ ${property.district} ตรงกัน`);
  }

  // Bedrooms match
  if (demand.bedroomsMin && property.bedrooms) {
    if (property.bedrooms >= demand.bedroomsMin) {
      if (demand.bedroomsMax && property.bedrooms <= demand.bedroomsMax) {
        score += 10;
        reasons.push(`${property.bedrooms} ห้องนอน ตรงตามต้องการ`);
      } else if (!demand.bedroomsMax) {
        score += 10;
        reasons.push(`${property.bedrooms} ห้องนอน ตามที่ต้องการ`);
      }
    }
  }

  // Area match
  if (demand.areaMin && property.area) {
    const propertyArea = Number(property.area);
    const areaMin = Number(demand.areaMin);
    const areaMax = demand.areaMax ? Number(demand.areaMax) : Infinity;

    if (propertyArea >= areaMin && propertyArea <= areaMax) {
      score += 5;
      reasons.push(`พื้นที่ ${propertyArea} ตร.ม. ตรงตามต้องการ`);
    }
  }

  // Normalize score to 100
  return {
    score: Math.min(Math.round((score / 100) * 100), 100),
    reasons,
  };
}

// ===== Store Match Results =====
export async function storeMatchResults(
  demandId: string,
  matches: MatchResult[]
): Promise<void> {
  if (matches.length === 0) return;

  const values = matches.map((match) => ({
    id: nanoid(),
    demandId,
    propertyId: match.propertyId,
    matchScore: match.matchScore,
    matchedAt: new Date(),
  }));

  // Upsert matches
  for (const value of values) {
    await db
      .insert(demandMatches)
      .values(value)
      .onConflictDoUpdate({
        target: [demandMatches.demandId, demandMatches.propertyId],
        set: {
          matchScore: value.matchScore,
          matchedAt: new Date(),
        },
      })
      .catch(() => {
        // Ignore duplicate key errors
      });
  }
}

// ===== Get Matches for Demand =====
export async function getDemandMatches(demandId: string) {
  const matches = await db
    .select({
      id: demandMatches.id,
      propertyId: demandMatches.propertyId,
      matchScore: demandMatches.matchScore,
      isViewed: demandMatches.isViewed,
      isSaved: demandMatches.isSaved,
      isContacted: demandMatches.isContacted,
      matchedAt: demandMatches.matchedAt,
      // Property details
      property: {
        id: properties.id,
        title: properties.title,
        slug: properties.slug,
        propertyType: properties.propertyType,
        listingType: properties.listingType,
        price: properties.price,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        area: properties.area,
        province: properties.province,
        district: properties.district,
        thumbnailUrl: properties.thumbnailUrl,
      },
    })
    .from(demandMatches)
    .innerJoin(properties, eq(demandMatches.propertyId, properties.id))
    .where(eq(demandMatches.demandId, demandId))
    .orderBy(desc(demandMatches.matchScore));

  return matches;
}

// ===== Update Match Status =====
export async function updateMatchStatus(
  matchId: string,
  userId: string,
  status: { isViewed?: boolean; isSaved?: boolean; isContacted?: boolean }
) {
  // Verify ownership through demand
  const [match] = await db
    .select({
      id: demandMatches.id,
      demandId: demandMatches.demandId,
      userId: demandPosts.userId,
    })
    .from(demandMatches)
    .innerJoin(demandPosts, eq(demandMatches.demandId, demandPosts.id))
    .where(eq(demandMatches.id, matchId))
    .limit(1);

  if (!match || match.userId !== userId) {
    throw new Error("Match not found or access denied");
  }

  const [updated] = await db
    .update(demandMatches)
    .set(status)
    .where(eq(demandMatches.id, matchId))
    .returning();

  return updated;
}

// ===== Count Matches for Demand =====
export async function countDemandMatches(demandId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(demandMatches)
    .where(eq(demandMatches.demandId, demandId));

  return Number(result.count);
}
