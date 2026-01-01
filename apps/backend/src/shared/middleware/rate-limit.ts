import { createMiddleware } from "hono/factory";
import { Ratelimit } from "@upstash/ratelimit";
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
 * Rate limiter middleware using @upstash/ratelimit
 */
export const rateLimiter = (options: RateLimitOptions = {}) => {
  const { limit = 100, window = 60, prefix = "ratelimit" } = options;

  // Create a new ratelimit instance
  // We recreate it here to support dynamic options per route if needed,
  // but typically this fits well with the Hono middleware factory pattern.
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${window} s` as any),
    analytics: true,
    prefix,
  });

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

    const identifier = ip;

    try {
      const {
        success,
        limit: l,
        remaining,
        reset,
      } = await ratelimit.limit(identifier);

      // Set rate limit headers
      c.header("X-RateLimit-Limit", l.toString());
      c.header("X-RateLimit-Remaining", remaining.toString());
      c.header("X-RateLimit-Reset", reset.toString());

      if (!success) {
        throw new TooManyRequestsError(
          `Rate limit exceeded. Try again in ${window} seconds.`
        );
      }

      await next();
    } catch (error) {
      if (error instanceof TooManyRequestsError) {
        throw error;
      }
      // If redis fails, we should probably allow the request or log error
      console.error("Rate limit error:", error);
      await next();
    }
  });
};
