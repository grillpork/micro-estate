import { z } from "zod";

export const PROPERTY_TYPE = {
  HOUSE: "house",
  CONDO: "condo",
  TOWNHOUSE: "townhouse",
  LAND: "land",
  COMMERCIAL: "commercial",
  APARTMENT: "apartment",
} as const;

export const LISTING_TYPE = {
  SALE: "sale",
  RENT: "rent",
} as const;

export const createPropertySchema = z.object({
  title: z.string().min(5, "หัวข้อต้องมีอย่างน้อย 5 ตัวอักษร").max(200),
  description: z.string().optional(),
  propertyType: z.enum(Object.values(PROPERTY_TYPE) as [string, ...string[]], {
    message: "กรุณาเลือกประเภทอสังหาฯ",
  }),
  listingType: z.enum(Object.values(LISTING_TYPE) as [string, ...string[]], {
    message: "กรุณาเลือกประเภทการประกาศ",
  }),
  price: z.coerce.number().positive("ราคาต้องมากกว่า 0"),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  area: z.coerce.number().positive("พื้นที่ต้องมากกว่า 0").optional(),
  landArea: z.coerce.number().positive().optional(),
  floors: z.coerce.number().int().min(1).optional(),
  address: z.string().min(1, "กรุณาระบุที่อยู่ (เลขที่บ้าน/ซอย/ถนน)"),
  district: z.string().min(1, "กรุณาเลือกเขต/อำเภอ"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  subDistrict: z.string().min(1, "กรุณาเลือกแขวง/ตำบล"),
  postalCode: z.string().optional(),
  amenityIds: z.array(z.string()).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        isPrimary: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .min(1, "กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป")
    .optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
