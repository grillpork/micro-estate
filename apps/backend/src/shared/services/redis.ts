import { Redis } from "@upstash/redis";
import { env } from "../../config/env";
import { CACHE_TTL } from "../constants";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// ===== Cache Helpers =====

/**
 * Get cached data or fetch and cache it
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  await redis.set(key, data, { ex: ttl });
  return data;
}

/**
 * Invalidate cache by key
 */
export async function invalidate(key: string): Promise<void> {
  await redis.del(key);
}

/**
 * Cache key builders
 */
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  property: (id: string) => `property:${id}`,
  propertySlug: (slug: string) => `property:slug:${slug}`,
  properties: (params: string) => `properties:${params}`,
  search: (query: string) => `search:${query}`,
  session: (id: string) => `session:${id}`,
};

/**
 * Generate stable cache key from object (sorts keys)
 */
export function generateStableCacheKey(obj: Record<string, any>): string {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = sortedKeys.reduce(
    (acc, key) => {
      acc[key] = obj[key];
      return acc;
    },
    {} as Record<string, any>
  );
  return JSON.stringify(sortedObj);
}
