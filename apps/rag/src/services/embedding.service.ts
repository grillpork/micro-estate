import { GoogleGenerativeAI } from "@google/generative-ai";
import pLimit from "p-limit";
import { env } from "../config/env";

// =====================
// Init Gemini
// =====================
const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);

const embeddingModel = genAI.getGenerativeModel({
  model: env.EMBEDDING_MODEL,
});

const chatModel = genAI.getGenerativeModel({
  model: env.CHAT_MODEL,
});

// =====================
// Utils
// =====================
function normalizeTextForEmbedding(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 800); // ป้องกัน text ยาวเกินจน timeout
}

async function embedWithRetry(text: string, retry = 2): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    if (retry > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return embedWithRetry(text, retry - 1);
    }
    throw error;
  }
}

// จำกัด concurrency (สำคัญมากสำหรับ Gemini)
const limit = pLimit(2);

// =====================
// Embedding APIs
// =====================
export async function generateEmbedding(text: string): Promise<number[]> {
  const normalized = normalizeTextForEmbedding(text);
  return embedWithRetry(normalized);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const tasks = texts.map((text) =>
    limit(() => embedWithRetry(normalizeTextForEmbedding(text)))
  );

  return Promise.all(tasks);
}

// =====================
// Similarity
// =====================
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// =====================
// Export chat model
// =====================
export { chatModel };
