import { eq, and, sql, desc, gte, or } from "drizzle-orm";
import { db } from "../../db";
import {
  properties,
  propertyImages,
  demandPosts,
  demandMatches,
  messages,
  transactions,
} from "../../db/schema";
import { PROPERTY_STATUS, DEMAND_STATUS } from "../../shared/constants";

// ===== Types =====
export interface AgentDashboardStats {
  totalProperties: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
  pendingRequests: number;
  matchedDemands: number;
  totalRevenue: number;
}

export interface RecentActivity {
  id: string;
  type: "view" | "inquiry" | "match";
  message: string;
  createdAt: Date;
  propertyId?: string;
  propertyTitle?: string;
}

export interface AgentProperty {
  id: string;
  title: string;
  price: number;
  status: string;
  views: number;
  inquiries: number;
  thumbnail?: string;
}

// ===== Get Agent Dashboard Stats =====
export async function getAgentDashboardStats(
  userId: string
): Promise<AgentDashboardStats> {
  // Get property stats
  const [propertyStats] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${properties.status} = 'active')`,
      pending: sql<number>`count(*) filter (where ${properties.status} = 'pending' or ${properties.status} = 'draft')`,
      totalViews: sql<number>`coalesce(sum(${properties.views}), 0)`,
    })
    .from(properties)
    .where(eq(properties.userId, userId));

  // Count inquiries (messages received about properties)
  // We'll count unique conversations as inquiries
  const [inquiryStats] = await db
    .select({
      count: sql<number>`count(distinct ${messages.senderId})`,
    })
    .from(messages)
    .where(eq(messages.receiverId, userId));

  // Count matched demands for this agent's properties
  const [matchedStats] = await db
    .select({
      count: sql<number>`count(distinct ${demandMatches.demandId})`,
    })
    .from(demandMatches)
    .innerJoin(properties, eq(demandMatches.propertyId, properties.id))
    .where(eq(properties.userId, userId));

  // Calculate total revenue from successful transactions related to agent's properties
  const [revenueStats] = await db
    .select({
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .innerJoin(properties, eq(transactions.propertyId, properties.id))
    .where(
      and(eq(properties.userId, userId), eq(transactions.status, "successful"))
    );

  return {
    totalProperties: Number(propertyStats.total) || 0,
    activeListings: Number(propertyStats.active) || 0,
    totalViews: Number(propertyStats.totalViews) || 0,
    totalInquiries: Number(inquiryStats.count) || 0,
    pendingRequests: Number(propertyStats.pending) || 0,
    matchedDemands: Number(matchedStats.count) || 0,
    totalRevenue: Number(revenueStats.total) || 0,
  };
}

// ===== Get Agent's Properties for Dashboard =====
export async function getAgentProperties(
  userId: string,
  limit: number = 5
): Promise<AgentProperty[]> {
  const props = await db
    .select({
      id: properties.id,
      title: properties.title,
      price: properties.price,
      status: properties.status,
      views: properties.views,
      thumbnailUrl: properties.thumbnailUrl,
    })
    .from(properties)
    .where(eq(properties.userId, userId))
    .orderBy(desc(properties.createdAt))
    .limit(limit);

  // Get inquiry counts per property (messages from others about inquiries)
  const inquiryCounts = await Promise.all(
    props.map(async (prop) => {
      // For now, we'll use a simple proxy: count messages to this user
      // In a real app, you'd have a dedicated inquiries table
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(eq(messages.receiverId, userId));
      return {
        propertyId: prop.id,
        count: Math.floor(Number(result.count) / Math.max(1, props.length)),
      };
    })
  );

  return props.map((prop, index) => ({
    id: prop.id,
    title: prop.title,
    price: Number(prop.price) || 0,
    status: prop.status,
    views: prop.views || 0,
    inquiries: inquiryCounts[index]?.count || 0,
    thumbnail: prop.thumbnailUrl || undefined,
  }));
}

// ===== Get Recent Activity for Agent =====
export async function getAgentRecentActivity(
  userId: string,
  limit: number = 10
): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  // Get recent property views (properties with recent view updates)
  const recentlyViewed = await db
    .select({
      id: properties.id,
      title: properties.title,
      views: properties.views,
      updatedAt: properties.updatedAt,
    })
    .from(properties)
    .where(and(eq(properties.userId, userId), gte(properties.views, 1)))
    .orderBy(desc(properties.updatedAt))
    .limit(3);

  for (const prop of recentlyViewed) {
    if (prop.views && prop.views > 0) {
      activities.push({
        id: `view-${prop.id}`,
        type: "view",
        message: `มีผู้ชม '${prop.title}' ${prop.views} ครั้ง`,
        createdAt: prop.updatedAt,
        propertyId: prop.id,
        propertyTitle: prop.title,
      });
    }
  }

  // Get recent messages (inquiries)
  const recentMessages = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.receiverId, userId))
    .orderBy(desc(messages.createdAt))
    .limit(3);

  for (const msg of recentMessages) {
    activities.push({
      id: `inquiry-${msg.id}`,
      type: "inquiry",
      message: `มีผู้สนใจติดต่อ: ${msg.content?.substring(0, 50) || "ข้อความใหม่"}...`,
      createdAt: msg.createdAt,
    });
  }

  // Get recent demand matches
  const recentMatches = await db
    .select({
      matchId: demandMatches.id,
      propertyId: demandMatches.propertyId,
      propertyTitle: properties.title,
      matchedAt: demandMatches.matchedAt,
      matchScore: demandMatches.matchScore,
    })
    .from(demandMatches)
    .innerJoin(properties, eq(demandMatches.propertyId, properties.id))
    .where(eq(properties.userId, userId))
    .orderBy(desc(demandMatches.matchedAt))
    .limit(3);

  for (const match of recentMatches) {
    activities.push({
      id: `match-${match.matchId}`,
      type: "match",
      message: `พบความต้องการที่ตรงกับ '${match.propertyTitle}' (${match.matchScore || 0}% ตรงกัน)`,
      createdAt: match.matchedAt,
      propertyId: match.propertyId,
      propertyTitle: match.propertyTitle,
    });
  }

  // Sort by date and limit
  return activities
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

// ===== Get Matched Demands Count for Agent =====
export async function getAgentMatchedDemandsCount(
  userId: string
): Promise<number> {
  const [result] = await db
    .select({
      count: sql<number>`count(distinct ${demandMatches.demandId})`,
    })
    .from(demandMatches)
    .innerJoin(properties, eq(demandMatches.propertyId, properties.id))
    .where(eq(properties.userId, userId));

  return Number(result.count) || 0;
}

// ===== Get Full Dashboard Data =====
export async function getAgentDashboard(userId: string) {
  const [stats, properties, recentActivity] = await Promise.all([
    getAgentDashboardStats(userId),
    getAgentProperties(userId, 5),
    getAgentRecentActivity(userId, 10),
  ]);

  return {
    stats,
    properties,
    recentActivity,
  };
}
