import { z } from "zod";
import { PROPERTY_TYPE, LISTING_TYPE } from "../../shared/constants";

export const searchQuerySchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).optional(),
  propertyType: z
    .enum(Object.values(PROPERTY_TYPE) as [string, ...string[]])
    .optional(),
  listingType: z
    .enum(Object.values(LISTING_TYPE) as [string, ...string[]])
    .optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  province: z.string().optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
