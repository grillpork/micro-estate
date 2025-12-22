import { createMiddleware } from "hono/factory";
import { redis } from "../services/redis";
import { TooManyRequestsError } from "../errors";

interface RateLimitOptions {
  /** Max requests per window */
  limit?: number;
  /** Window size in seconds */
  window?: number;
  /** Key prefix */
  prefix?: string;
}

/**
 * Rate limiter middleware using Redis
 */
export const rateLimiter = (options: RateLimitOptions = {}) => {
  const { limit = 100, window = 60, prefix = "ratelimit" } = options;

  return createMiddleware(async (c, next) => {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === "development") {
      return await next();
    }

    // Get client IP
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown";

    const key = `${prefix}:${ip}`;

    // Get current count
    const current = await redis.get<number>(key);

    if (current !== null && current >= limit) {
      throw new TooManyRequestsError(
        `Rate limit exceeded. Try again in ${window} seconds.`
      );
    }

    // Increment count
    if (current === null) {
      await redis.set(key, 1, { ex: window });
    } else {
      await redis.incr(key);
    }

    // Set rate limit headers
    c.header("X-RateLimit-Limit", limit.toString());
    c.header(
      "X-RateLimit-Remaining",
      Math.max(0, limit - (current || 0) - 1).toString()
    );

    await next();
  });
};
