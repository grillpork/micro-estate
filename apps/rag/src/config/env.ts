import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4001),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Google AI (Gemini)
  GOOGLE_AI_API_KEY: z.string().min(1, "Google AI API key is required"),

  // Embedding model
  EMBEDDING_MODEL: z.string().default("text-embedding-004"),

  // Chat model (for summarization and intent extraction)
  CHAT_MODEL: z.string().default("gemini-1.5-flash"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables (RAG Service):");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
