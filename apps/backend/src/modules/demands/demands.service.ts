import { eq, and, desc, asc, sql, gte, lte, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db";
import { demandPosts, demandMatches, demandEmbeddings } from "../../db/schema";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../shared/errors";
import { DEMAND_STATUS, DEMAND_LIMITS } from "../../shared/constants";
import {
  processDemandWithAI,
  generateEmbedding,
  isRagServiceAvailable,
} from "../../shared/services/rag.client";
import type {
  CreateDemandInput,
  UpdateDemandInput,
  DemandQuery,
} from "./demands.schema";

// ===== Helper: Calculate expiry date =====
function calculateExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + DEMAND_LIMITS.EXPIRY_DAYS);
  return date;
}

// ===== Helper: Generate content hash for cache invalidation =====
function generateContentHash(data: CreateDemandInput): string {
  const content = JSON.stringify({
    intent: data.intent,
    propertyType: data.propertyType,
    budgetMin: data.budgetMin,
    budgetMax: data.budgetMax,
    province: data.province,
    district: data.district,
    nearBts: data.nearBts,
    nearMrt: data.nearMrt,
    bedroomsMin: data.bedroomsMin,
    bedroomsMax: data.bedroomsMax,
    bathroomsMin: data.bathroomsMin,
    areaMin: data.areaMin,
    areaMax: data.areaMax,
    description: data.description,
  });
  // Simple hash using Bun's built-in
  return Bun.hash(content).toString(16);
}

// ===== Get user's active demand count =====
async function getUserActiveDemandCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(demandPosts)
    .where(
      and(
        eq(demandPosts.userId, userId),
        eq(demandPosts.status, DEMAND_STATUS.ACTIVE)
      )
    );
  return Number(result.count);
}

// ===== Create Demand =====

export async function createDemand(data: CreateDemandInput, userId: string) {
  // Check active demand limit
  const activeCount = await getUserActiveDemandCount(userId);
  if (activeCount >= DEMAND_LIMITS.MAX_ACTIVE_PER_USER) {
    throw new BadRequestError(
      `You can only have ${DEMAND_LIMITS.MAX_ACTIVE_PER_USER} active demand posts at a time. Please close existing ones first.`
    );
  }

  const id = nanoid();

  // Insert demand immediately (fast path)
  const [demand] = await db
    .insert(demandPosts)
    .values({
      id,
      userId,
      intent: data.intent as any,
      propertyType: data.propertyType,
      budgetMin: data.budgetMin?.toString(),
      budgetMax: data.budgetMax?.toString(),
      province: data.province,
      district: data.district,
      nearBts: data.nearBts,
      nearMrt: data.nearMrt,
      bedroomsMin: data.bedroomsMin,
      bedroomsMax: data.bedroomsMax,
      bathroomsMin: data.bathroomsMin,
      areaMin: data.areaMin?.toString(),
      areaMax: data.areaMax?.toString(),
      description: data.description,
      summary: null, // Will be populated by AI later
      tags: data.tags ? JSON.stringify(data.tags) : null,
      readinessScore: null, // Will be populated by AI later
      urgency: data.urgency as any,
      isPublic: data.isPublic,
      maxAgents: data.maxAgents,
      status: DEMAND_STATUS.ACTIVE as any,
      expiresAt: calculateExpiryDate(),
    })
    .returning();

  // Trigger AI processing in background (fire and forget)
  processDemandInBackground(id, data).catch((err) => {
    console.error(`[Background] Failed to process demand ${id}:`, err);
  });

  return {
    ...demand,
    tags: data.tags || [],
  };
}

// ===== Background: Process Demand with AI =====
async function processDemandInBackground(
  demandId: string,
  data: CreateDemandInput
) {
  const ragAvailable = await isRagServiceAvailable();
  if (!ragAvailable) return;

  try {
    // 1. Process with AI to get summary, tags, score
    const processed = await processDemandWithAI({
      intent: data.intent,
      propertyType: data.propertyType,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      province: data.province,
      district: data.district,
      nearBts: data.nearBts,
      nearMrt: data.nearMrt,
      bedroomsMin: data.bedroomsMin,
      bedroomsMax: data.bedroomsMax,
      bathroomsMin: data.bathroomsMin,
      areaMin: data.areaMin,
      areaMax: data.areaMax,
      description: data.description,
    });

    if (!processed) return;

    // 2. Update Demand with AI results
    const aiTags = [
      ...new Set([...(data.tags || []), ...processed.tags]),
    ].slice(0, DEMAND_LIMITS.MAX_TAGS);

    await db
      .update(demandPosts)
      .set({
        summary: processed.summary,
        tags: JSON.stringify(aiTags),
        readinessScore: processed.readinessScore,
        updatedAt: new Date(),
      })
      .where(eq(demandPosts.id, demandId));

    // 3. Generate and Store Embedding
    if (processed.searchableText) {
      await generateAndStoreEmbedding(
        demandId,
        processed.searchableText,
        generateContentHash(data)
      );
    }
  } catch (error) {
    console.error(`Error processing demand ${demandId} in background:`, error);
  }
}

// ===== Helper: Generate and store embedding =====
async function generateAndStoreEmbedding(
  demandId: string,
  text: string,
  contentHash: string
): Promise<void> {
  const embedding = await generateEmbedding(text);
  if (!embedding) return;

  await db
    .insert(demandEmbeddings)
    .values({
      id: nanoid(),
      demandId,
      embedding: JSON.stringify(embedding),
      contentHash,
    })
    .onConflictDoUpdate({
      target: demandEmbeddings.demandId,
      set: {
        embedding: JSON.stringify(embedding),
        contentHash,
        updatedAt: new Date(),
      },
    });
}

// ===== Get Demand by ID =====
export async function getDemandById(id: string, userId?: string) {
  const [demand] = await db
    .select()
    .from(demandPosts)
    .where(eq(demandPosts.id, id))
    .limit(1);

  if (!demand) {
    throw new NotFoundError("Demand post");
  }

  // If not public and not owner, deny access
  if (!demand.isPublic && demand.userId !== userId) {
    throw new ForbiddenError("You don't have access to this demand post");
  }

  return {
    ...demand,
    tags: demand.tags ? JSON.parse(demand.tags) : [],
  };
}

// ===== Get User's Demands =====
export async function getUserDemands(userId: string) {
  const demands = await db
    .select()
    .from(demandPosts)
    .where(eq(demandPosts.userId, userId))
    .orderBy(desc(demandPosts.createdAt));

  return demands.map((d) => ({
    ...d,
    tags: d.tags ? JSON.parse(d.tags) : [],
  }));
}

// ===== Get Public Demands (for agents) with Hybrid Pagination =====
export async function getPublicDemands(query: DemandQuery) {
  const {
    page,
    limit,
    offset: providedOffset,
    sort,
    sortBy,
    ...filters
  } = query;

  // Hybrid pagination: use offset if provided, otherwise calculate from page
  const offset =
    providedOffset !== undefined ? providedOffset : (page - 1) * limit;
  const currentPage =
    providedOffset !== undefined
      ? Math.floor(providedOffset / limit) + 1
      : page;

  // Build conditions - only public and active
  const conditions = [
    eq(demandPosts.isPublic, true),
    eq(demandPosts.status, DEMAND_STATUS.ACTIVE as any),
  ];

  // Apply filters
  if (filters.intent) {
    conditions.push(eq(demandPosts.intent, filters.intent as any));
  }
  if (filters.propertyType) {
    conditions.push(eq(demandPosts.propertyType, filters.propertyType));
  }
  if (filters.province) {
    conditions.push(eq(demandPosts.province, filters.province));
  }
  if (filters.district) {
    conditions.push(eq(demandPosts.district, filters.district));
  }
  if (filters.urgency) {
    conditions.push(eq(demandPosts.urgency, filters.urgency as any));
  }
  if (filters.minBudget) {
    conditions.push(gte(demandPosts.budgetMax, filters.minBudget.toString()));
  }
  if (filters.maxBudget) {
    conditions.push(lte(demandPosts.budgetMin, filters.maxBudget.toString()));
  }

  // Determine sort
  const sortColumn =
    {
      createdAt: demandPosts.createdAt,
      urgency: demandPosts.urgency,
      budgetMax: demandPosts.budgetMax,
    }[sortBy] || demandPosts.createdAt;

  const orderBy = sort === "asc" ? asc(sortColumn) : desc(sortColumn);

  // Query data
  const data = await db
    .select({
      id: demandPosts.id,
      // Blind data - no userId revealed
      intent: demandPosts.intent,
      propertyType: demandPosts.propertyType,
      budgetMin: demandPosts.budgetMin,
      budgetMax: demandPosts.budgetMax,
      province: demandPosts.province,
      district: demandPosts.district,
      nearBts: demandPosts.nearBts,
      nearMrt: demandPosts.nearMrt,
      bedroomsMin: demandPosts.bedroomsMin,
      bedroomsMax: demandPosts.bedroomsMax,
      bathroomsMin: demandPosts.bathroomsMin,
      areaMin: demandPosts.areaMin,
      areaMax: demandPosts.areaMax,
      description: demandPosts.description,
      summary: demandPosts.summary,
      tags: demandPosts.tags,
      urgency: demandPosts.urgency,
      maxAgents: demandPosts.maxAgents,
      createdAt: demandPosts.createdAt,
    })
    .from(demandPosts)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Get total
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(demandPosts)
    .where(and(...conditions));

  return {
    data: data.map((d) => ({
      ...d,
      tags: d.tags ? JSON.parse(d.tags) : [],
    })),
    total: Number(count),
    page: currentPage,
    limit,
    offset,
  };
}

// ===== Update Demand =====
export async function updateDemand(
  id: string,
  data: UpdateDemandInput,
  userId: string
) {
  // Verify ownership
  const [existing] = await db
    .select()
    .from(demandPosts)
    .where(eq(demandPosts.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Demand post");
  }

  if (existing.userId !== userId) {
    throw new ForbiddenError("Not authorized to update this demand post");
  }

  const [updated] = await db
    .update(demandPosts)
    .set({
      ...(data.intent && { intent: data.intent as any }),
      ...(data.propertyType && { propertyType: data.propertyType }),
      ...(data.budgetMin !== undefined && {
        budgetMin: data.budgetMin?.toString(),
      }),
      ...(data.budgetMax !== undefined && {
        budgetMax: data.budgetMax?.toString(),
      }),
      ...(data.province !== undefined && { province: data.province }),
      ...(data.district !== undefined && { district: data.district }),
      ...(data.nearBts !== undefined && { nearBts: data.nearBts }),
      ...(data.nearMrt !== undefined && { nearMrt: data.nearMrt }),
      ...(data.bedroomsMin !== undefined && { bedroomsMin: data.bedroomsMin }),
      ...(data.bedroomsMax !== undefined && { bedroomsMax: data.bedroomsMax }),
      ...(data.bathroomsMin !== undefined && {
        bathroomsMin: data.bathroomsMin,
      }),
      ...(data.areaMin !== undefined && { areaMin: data.areaMin?.toString() }),
      ...(data.areaMax !== undefined && { areaMax: data.areaMax?.toString() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.tags && { tags: JSON.stringify(data.tags) }),
      ...(data.urgency && { urgency: data.urgency as any }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      ...(data.maxAgents !== undefined && { maxAgents: data.maxAgents }),
      ...(data.status && { status: data.status as any }),
      updatedAt: new Date(),
    })
    .where(eq(demandPosts.id, id))
    .returning();

  return {
    ...updated,
    tags: updated.tags ? JSON.parse(updated.tags) : [],
  };
}

// ===== Close/Delete Demand =====
export async function closeDemand(id: string, userId: string) {
  const [existing] = await db
    .select()
    .from(demandPosts)
    .where(eq(demandPosts.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Demand post");
  }

  if (existing.userId !== userId) {
    throw new ForbiddenError("Not authorized to close this demand post");
  }

  const [updated] = await db
    .update(demandPosts)
    .set({
      status: DEMAND_STATUS.CLOSED as any,
      updatedAt: new Date(),
    })
    .where(eq(demandPosts.id, id))
    .returning();

  return updated;
}

// ===== Delete Demand (hard delete) =====
export async function deleteDemand(id: string, userId: string) {
  const [existing] = await db
    .select()
    .from(demandPosts)
    .where(eq(demandPosts.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Demand post");
  }

  if (existing.userId !== userId) {
    throw new ForbiddenError("Not authorized to delete this demand post");
  }

  await db.delete(demandPosts).where(eq(demandPosts.id, id));

  return { deleted: true };
}

// ===== Get Demand Statistics (for user) =====
export async function getUserDemandStats(userId: string) {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${demandPosts.status} = 'active')`,
      matched: sql<number>`count(*) filter (where ${demandPosts.status} = 'matched')`,
      closed: sql<number>`count(*) filter (where ${demandPosts.status} = 'closed')`,
    })
    .from(demandPosts)
    .where(eq(demandPosts.userId, userId));

  return {
    total: Number(stats.total),
    active: Number(stats.active),
    matched: Number(stats.matched),
    closed: Number(stats.closed),
    remainingSlots: DEMAND_LIMITS.MAX_ACTIVE_PER_USER - Number(stats.active),
  };
}
