/**
 * Profile Schemas
 * Zod validation schemas for profile forms
 */
import { z } from "zod";

// === Update Profile ===
export const updateProfileSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").optional(),
  phone: z
    .string()
    .regex(/^0[0-9]{8,9}$/, "เบอร์โทรศัพท์ไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "ประวัติต้องไม่เกิน 500 ตัวอักษร").optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
