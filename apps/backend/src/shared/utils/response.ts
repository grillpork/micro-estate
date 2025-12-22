import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Success response helper
 */
export const success = <T>(
  c: Context,
  data: T,
  status: ContentfulStatusCode = 200
) => {
  return c.json({ success: true, data }, status);
};

/**
 * Created response helper (201)
 */
export const created = <T>(c: Context, data: T) => {
  return c.json({ success: true, data }, 201);
};

/**
 * Error response helper
 */
export const error = (
  c: Context,
  message: string,
  status: ContentfulStatusCode = 400,
  code?: string
) => {
  return c.json({ success: false, error: message, code }, status);
};

/**
 * Paginated response helper (Hybrid pagination)
 * Supports both page-based and offset-based pagination in response
 */
export const paginate = <T>(
  c: Context,
  data: T[],
  total: number,
  page: number,
  limit: number,
  offset?: number
) => {
  const currentOffset = offset ?? (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);
  const hasMore = currentOffset + data.length < total;
  const nextOffset = hasMore ? currentOffset + limit : null;

  return c.json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      offset: currentOffset,
      totalPages,
      hasMore,
      nextOffset,
    },
  });
};

/**
 * No content response (204)
 */
export const noContent = (c: Context) => {
  return c.body(null, 204);
};
