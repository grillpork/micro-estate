import { z } from "zod";

// ===== Send Message Schema =====
export const sendMessageSchema = z
  .object({
    receiverId: z.string().min(1),
    content: z.string().min(1).max(5000).optional(),
    imageUrls: z.array(z.string().url()).max(10).optional(),
  })
  .refine(
    (data) => data.content || (data.imageUrls && data.imageUrls.length > 0),
    { message: "Either content or imageUrls must be provided" }
  );

// ===== Mark as Read Schema =====
export const markReadSchema = z.object({
  messageIds: z.array(z.string().min(1)).min(1).max(100),
});

// ===== Get Messages Schema =====
export const getMessagesSchema = z.object({
  partnerId: z.string().min(1),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ===== Typing Indicator Schema =====
export const typingSchema = z.object({
  receiverId: z.string().min(1),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type TypingInput = z.infer<typeof typingSchema>;

// ===== Delete Message Schema =====
export const deleteMessageSchema = z.object({
  messageId: z.string().min(1),
});

export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;
