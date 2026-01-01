import { z } from "zod";
import {
  PROPERTY_STATUS,
  PROPERTY_TYPE,
  LISTING_TYPE,
} from "../../shared/constants";

export const createPropertySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  propertyType: z.enum(Object.values(PROPERTY_TYPE) as [string, ...string[]]),
  listingType: z.enum(Object.values(LISTING_TYPE) as [string, ...string[]]),
  price: z.coerce.number().positive(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  area: z.coerce.number().positive().optional(),
  landArea: z.coerce.number().positive().optional(),
  floors: z.coerce.number().int().min(1).optional(),
  yearBuilt: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  address: z.string().optional(),
  subDistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  amenityIds: z.array(z.string()).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        isPrimary: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .optional(),
});

export const updatePropertySchema = createPropertySchema.partial().extend({
  status: z
    .enum(Object.values(PROPERTY_STATUS) as [string, ...string[]])
    .optional(),
});

export const propertyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(["createdAt", "price", "views"]).default("createdAt"),
  propertyType: z
    .enum(Object.values(PROPERTY_TYPE) as [string, ...string[]])
    .optional(),
  listingType: z
    .enum(Object.values(LISTING_TYPE) as [string, ...string[]])
    .optional(),
  status: z
    .enum(Object.values(PROPERTY_STATUS) as [string, ...string[]])
    .optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  province: z.string().optional(),
  q: z.string().optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
