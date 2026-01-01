import { env } from "../../config/env";

// ===== Types =====
export interface DemandInput {
  intent: string;
  propertyType: string;
  budgetMin?: number;
  budgetMax?: number;
  province?: string;
  district?: string;
  nearBts?: string;
  nearMrt?: string;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  areaMin?: number;
  areaMax?: number;
  description?: string;
}

export interface ProcessedDemand {
  summary: string;
  tags: string[];
  readinessScore: number;
  normalizedIntent: "buy" | "rent";
  searchableText: string;
}

export interface EmbeddingResult {
  embedding: number[];
}

// ===== RAG Service Client =====
const RAG_BASE_URL = env.RAG_SERVICE_URL;

/**
 * Check if RAG service is available
 */
export async function isRagServiceAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${RAG_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000), // 2s timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Process demand using RAG service
 */
export async function processDemandWithAI(
  input: DemandInput
): Promise<ProcessedDemand | null> {
  try {
    const response = await fetch(`${RAG_BASE_URL}/api/demands/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(120000), // 120s timeout for AI processing
    });

    if (!response.ok) {
      console.error("RAG service error:", await response.text());
      return null;
    }

    const result = await response.json();
    if (!result.success) {
      console.error("RAG processing failed:", result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Error calling RAG service:", error);
    return null;
  }
}

/**
 * Generate embedding for text
 */
export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  try {
    const response = await fetch(`${RAG_BASE_URL}/api/demands/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(300000), // 300s timeout
    });

    if (!response.ok) {
      console.error("Embedding error:", await response.text());
      return null;
    }

    const result = await response.json();
    if (!result.success) {
      console.error("Embedding failed:", result.error);
      return null;
    }

    return result.data.embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][] | null> {
  try {
    const response = await fetch(`${RAG_BASE_URL}/api/demands/embed-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
      signal: AbortSignal.timeout(300000), // 300s timeout for batch
    });

    if (!response.ok) {
      console.error("Batch embedding error:", await response.text());
      return null;
    }

    const result = await response.json();
    if (!result.success) {
      console.error("Batch embedding failed:", result.error);
      return null;
    }

    return result.data.embeddings;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return null;
  }
}

/**
 * Calculate similarity between two vectors
 */
export async function calculateSimilarity(
  vectorA: number[],
  vectorB: number[]
): Promise<number | null> {
  try {
    const response = await fetch(`${RAG_BASE_URL}/api/demands/similarity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vectorA, vectorB }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error("Similarity error:", await response.text());
      return null;
    }

    const result = await response.json();
    if (!result.success) {
      console.error("Similarity failed:", result.error);
      return null;
    }

    return result.data.similarity;
  } catch (error) {
    console.error("Error calculating similarity:", error);
    return null;
  }
}
