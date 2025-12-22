import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);

// Get embedding model
const embeddingModel = genAI.getGenerativeModel({
  model: env.EMBEDDING_MODEL,
});

// Get chat model for text processing
const chatModel = genAI.getGenerativeModel({
  model: env.CHAT_MODEL,
});

/**
 * Generate embedding for text using Gemini
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const results = await Promise.all(
      texts.map((text) => embeddingModel.embedContent(text))
    );
    return results.map((result) => result.embedding.values);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error("Failed to generate embeddings");
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export { chatModel };
