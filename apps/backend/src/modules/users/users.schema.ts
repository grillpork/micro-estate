import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
