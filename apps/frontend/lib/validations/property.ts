import * as z from "zod";

// Helper to handle NaN values from number inputs
const optionalNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
}, z.number().optional().nullable());

const requiredNumber = (message: string) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number({ message }).min(1, message)
  );

export const propertySchema = z.object({
  title: z.string().min(5, "หัวข้อต้องมีอย่างน้อย 5 ตัวอักษร"),
  description: z.string().min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร"),
  price: requiredNumber("กรุณาระบุราคา"),
  propertyType: z.enum(
    ["condo", "house", "townhouse", "land", "apartment", "commercial"],
    {
      message: "กรุณาเลือกประเภทอสังหาฯ",
    }
  ),
  listingType: z.enum(["sale", "rent"], {
    message: "กรุณาเลือกประเภทประกาศ",
  }),

  // Property Details - all optional with NaN handling
  bedrooms: optionalNumber,
  bathrooms: optionalNumber,
  area: requiredNumber("กรุณาระบุพื้นที่ใช้สอย"),
  landArea: optionalNumber,
  floor: optionalNumber,
  totalFloors: optionalNumber,
  yearBuilt: optionalNumber,
  parking: optionalNumber,

  // Location
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกเขต/อำเภอ"),
  subDistrict: z.string().min(1, "กรุณาเลือกแขวง/ตำบล"),
  postalCode: z.string().optional().nullable(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Features & Media
  amenityIds: z.array(z.string()).optional(),
  images: z.any().optional(),

  // Thai specific land measurements
  rai: optionalNumber,
  ngan: optionalNumber,
  sqWah: optionalNumber,
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
