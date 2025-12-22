import { z } from "zod";
import { PAGINATION } from "../constants";

/**
 * Hybrid Pagination Schema
 * Supports both page-based and offset-based pagination:
 * - Page-based: ?page=1&limit=10 (for traditional pagination UI)
 * - Offset-based: ?limit=10&offset=0 (for infinite scroll, more flexible)
 *
 * Priority: If offset is provided, it takes precedence over page
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  offset: z.coerce.number().int().min(0).optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Calculate offset from pagination input
 * If offset is explicitly provided, use it; otherwise calculate from page
 */
export function calculateOffset(input: PaginationInput): number {
  if (input.offset !== undefined) {
    return input.offset;
  }
  return (input.page - 1) * input.limit;
}

/**
 * Calculate current page from offset (for response metadata)
 */
export function calculatePage(offset: number, limit: number): number {
  return Math.floor(offset / limit) + 1;
}

// ID param schema - accepts both UUID and nanoid formats
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export type IdParam = z.infer<typeof idParamSchema>;

export const searchQuerySchema = z.object({
  q: z.string().min(1).optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
