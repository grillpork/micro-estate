/**
 * Property Schemas
 * Zod validation schemas for property forms
 */
import { z } from "zod";

// Property types enum
export const propertyTypeSchema = z.enum([
  "condo",
  "house",
  "townhouse",
  "land",
  "apartment",
  "commercial",
]);

export const listingTypeSchema = z.enum(["sale", "rent"]);

// === Create/Edit Property ===
export const propertyFormSchema = z.object({
  title: z.string().min(5, "ชื่อต้องมีอย่างน้อย 5 ตัวอักษร"),
  description: z.string().min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร"),
  price: z.number().positive("ราคาต้องมากกว่า 0"),
  propertyType: propertyTypeSchema,
  listingType: listingTypeSchema,
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area: z.number().positive().optional(),
  landArea: z.number().positive().optional(),
  floor: z.number().int().min(0).optional(),
  totalFloors: z.number().int().min(1).optional(),
  yearBuilt: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  parking: z.number().int().min(0).optional(),
  // Location
  address: z.string().min(5, "ที่อยู่ต้องมีอย่างน้อย 5 ตัวอักษร"),
  district: z.string().min(2, "กรุณาระบุเขต/อำเภอ"),
  province: z.string().min(2, "กรุณาระบุจังหวัด"),
  postalCode: z.string().length(5, "รหัสไปรษณีย์ต้องมี 5 หลัก").optional(),
  // Amenities
  amenityIds: z.array(z.string()).optional(),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

// === Search Properties ===
export const searchPropertiesSchema = z.object({
  q: z.string().optional(),
  propertyType: propertyTypeSchema.optional(),
  listingType: listingTypeSchema.optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minBedrooms: z.number().int().min(0).optional(),
  maxBedrooms: z.number().int().min(0).optional(),
  province: z.string().optional(),
  district: z.string().optional(),
});

export type SearchPropertiesFormData = z.infer<typeof searchPropertiesSchema>;
