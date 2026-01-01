import { ilike, and, eq, gte, lte, or, sql, desc } from "drizzle-orm";
import { db } from "../../db";
import { properties, users } from "../../db/schema";
import {
  getOrSet,
  cacheKeys,
  generateStableCacheKey,
} from "../../shared/services/redis";
import { CACHE_TTL } from "../../shared/constants";
import type { SearchQuery } from "./search.schema";

/**
 * Search properties with caching (Hybrid pagination support)
 */
export async function searchProperties(query: SearchQuery) {
  const cacheKey = cacheKeys.search(generateStableCacheKey(query));

  return getOrSet(
    cacheKey,
    async () => {
      const { q, page, limit, offset: providedOffset, ...filters } = query;

      // Hybrid pagination: use offset if provided, otherwise calculate from page
      const offset =
        providedOffset !== undefined ? providedOffset : (page - 1) * limit;
      const currentPage =
        providedOffset !== undefined
          ? Math.floor(providedOffset / limit) + 1
          : page;

      // Build conditions
      const conditions = [
        eq(properties.status, "active"),
        or(
          ilike(properties.title, `%${q}%`),
          ilike(properties.description, `%${q}%`),
          ilike(properties.address, `%${q}%`),
          ilike(properties.district, `%${q}%`),
          ilike(properties.province, `%${q}%`)
        ),
      ];

      if (filters.propertyType) {
        conditions.push(
          eq(properties.propertyType, filters.propertyType as any)
        );
      }
      if (filters.listingType) {
        conditions.push(eq(properties.listingType, filters.listingType as any));
      }
      if (filters.province) {
        conditions.push(eq(properties.province, filters.province));
      }
      if (filters.minPrice) {
        conditions.push(gte(properties.price, filters.minPrice.toString()));
      }
      if (filters.maxPrice) {
        conditions.push(lte(properties.price, filters.maxPrice.toString()));
      }

      // Get results
      const data = await db
        .select({
          id: properties.id,
          title: properties.title,
          slug: properties.slug,
          price: properties.price,
          propertyType: properties.propertyType,
          listingType: properties.listingType,
          bedrooms: properties.bedrooms,
          bathrooms: properties.bathrooms,
          area: properties.area,
          district: properties.district,
          province: properties.province,
          thumbnailUrl: properties.thumbnailUrl,
          createdAt: properties.createdAt,
        })
        .from(properties)
        .where(and(...conditions))
        .orderBy(desc(properties.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(properties)
        .where(and(...conditions));

      return {
        data,
        total: Number(count),
        page: currentPage,
        limit,
        offset,
      };
    },
    CACHE_TTL.MEDIUM
  );
}

/**
 * Search users (agents)
 */
export async function searchAgents(query: string) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      phone: users.phone,
      bio: users.bio,
    })
    .from(users)
    .where(
      and(
        eq(users.role, "agent"),
        or(ilike(users.name, `%${query}%`), ilike(users.email, `%${query}%`))
      )
    )
    .limit(20);
}

/**
 * Get search suggestions
 */
export async function getSuggestions(query: string) {
  const results = await db
    .select({
      title: properties.title,
      province: properties.province,
      district: properties.district,
    })
    .from(properties)
    .where(
      and(
        eq(properties.status, "active"),
        or(
          ilike(properties.title, `%${query}%`),
          ilike(properties.province, `%${query}%`),
          ilike(properties.district, `%${query}%`)
        )
      )
    )
    .limit(10);

  // Extract unique suggestions
  const suggestions = new Set<string>();
  results.forEach((r) => {
    if (r.title?.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(r.title);
    }
    if (r.province?.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(r.province);
    }
    if (r.district?.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(r.district);
    }
  });

  return Array.from(suggestions).slice(0, 5);
}
