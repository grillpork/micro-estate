import { eq, sql, desc, and } from "drizzle-orm";
import { db } from "../../db";
import { properties, users, agentVerifications } from "../../db/schema";

// ===== Types =====
export interface PropertyTypeCount {
  type: string;
  count: number;
}

export interface FeaturedProperty {
  id: string;
  title: string;
  slug: string;
  price: number;
  listingType: string;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  province: string | null;
  district: string | null;
  thumbnailUrl: string | null;
}

export interface HomeStats {
  totalProperties: number;
  totalUsers: number;
  verifiedAgents: number;
}

export interface HomePageData {
  stats: HomeStats;
  propertyTypeCounts: PropertyTypeCount[];
  featuredProperties: FeaturedProperty[];
}

// ===== Get Property Type Counts =====
export async function getPropertyTypeCounts(): Promise<PropertyTypeCount[]> {
  const counts = await db
    .select({
      type: properties.propertyType,
      count: sql<number>`count(*)`,
    })
    .from(properties)
    .where(eq(properties.status, "active"))
    .groupBy(properties.propertyType);

  return counts.map((c) => ({
    type: c.type,
    count: Number(c.count),
  }));
}

// ===== Get Home Stats =====
export async function getHomeStats(): Promise<HomeStats> {
  // Count total active properties
  const [propStats] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(properties)
    .where(eq(properties.status, "active"));

  // Count total users
  const [userStats] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(users);

  // Count verified agents (approved status)
  const [agentStats] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(agentVerifications)
    .where(eq(agentVerifications.status, "approved"));

  return {
    totalProperties: Number(propStats.count) || 0,
    totalUsers: Number(userStats.count) || 0,
    verifiedAgents: Number(agentStats.count) || 0,
  };
}

// ===== Get Featured Properties =====
export async function getFeaturedProperties(
  limit: number = 6
): Promise<FeaturedProperty[]> {
  // Get featured or most viewed active properties
  const props = await db
    .select({
      id: properties.id,
      title: properties.title,
      slug: properties.slug,
      price: properties.price,
      listingType: properties.listingType,
      propertyType: properties.propertyType,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      area: properties.area,
      province: properties.province,
      district: properties.district,
      thumbnailUrl: properties.thumbnailUrl,
      isFeatured: properties.isFeatured,
      views: properties.views,
    })
    .from(properties)
    .where(eq(properties.status, "active"))
    .orderBy(desc(properties.isFeatured), desc(properties.views))
    .limit(limit);

  return props.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: Number(p.price) || 0,
    listingType: p.listingType,
    propertyType: p.propertyType,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area ? Number(p.area) : null,
    province: p.province,
    district: p.district,
    thumbnailUrl: p.thumbnailUrl,
  }));
}

// ===== Get All Home Page Data =====
export async function getHomePageData(): Promise<HomePageData> {
  const [stats, propertyTypeCounts, featuredProperties] = await Promise.all([
    getHomeStats(),
    getPropertyTypeCounts(),
    getFeaturedProperties(6),
  ]);

  return {
    stats,
    propertyTypeCounts,
    featuredProperties,
  };
}
