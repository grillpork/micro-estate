import { Hono } from "hono";
import { z } from "zod";
import {
  processDemand,
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity,
  chatWithAI,
} from "../services";

const demandRoutes = new Hono();

// ===== Schemas =====
const chatSchema = z.object({
  userId: z.string(),
  message: z.string(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});
const processDemandSchema = z.object({
  intent: z.string(),
  propertyType: z.string(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  nearBts: z.string().optional(),
  nearMrt: z.string().optional(),
  bedroomsMin: z.number().optional(),
  bedroomsMax: z.number().optional(),
  bathroomsMin: z.number().optional(),
  areaMin: z.number().optional(),
  areaMax: z.number().optional(),
  description: z.string().optional(),
});

const embedTextSchema = z.object({
  text: z.string().min(1),
});

const embedTextsSchema = z.object({
  texts: z.array(z.string().min(1)).min(1).max(100),
});

const similaritySchema = z.object({
  vectorA: z.array(z.number()),
  vectorB: z.array(z.number()),
});

// ===== Routes =====

/**
 * POST /process - Process demand and generate AI metadata
 */
demandRoutes.post("/process", async (c) => {
  try {
    const body = await c.req.json();
    const input = processDemandSchema.parse(body);
    const result = await processDemand(input);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error processing demand:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Processing failed",
      },
      400
    );
  }
});

/**
 * POST /embed - Generate embedding for single text
 */
demandRoutes.post("/embed", async (c) => {
  try {
    const body = await c.req.json();
    const { text } = embedTextSchema.parse(body);
    const embedding = await generateEmbedding(text);

    return c.json({
      success: true,
      data: { embedding },
    });
  } catch (error) {
    console.error("Error generating embedding:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Embedding failed",
      },
      400
    );
  }
});

/**
 * POST /embed-batch - Generate embeddings for multiple texts
 */
demandRoutes.post("/embed-batch", async (c) => {
  try {
    const body = await c.req.json();
    const { texts } = embedTextsSchema.parse(body);
    const embeddings = await generateEmbeddings(texts);

    return c.json({
      success: true,
      data: { embeddings },
    });
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Embedding failed",
      },
      400
    );
  }
});

/**
 * POST /similarity - Calculate cosine similarity between two vectors
 */
demandRoutes.post("/similarity", async (c) => {
  try {
    const body = await c.req.json();
    const { vectorA, vectorB } = similaritySchema.parse(body);
    const similarity = cosineSimilarity(vectorA, vectorB);

    return c.json({
      success: true,
      data: { similarity },
    });
  } catch (error) {
    console.error("Error calculating similarity:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Calculation failed",
      },
      400
    );
  }
});

/**
 * POST /chat - Chat with AI Assistant
 */
demandRoutes.post("/chat", async (c) => {
  try {
    const body = await c.req.json();
    const input = chatSchema.parse(body);
    const result = await chatWithAI(input);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Chat failed",
      },
      400
    );
  }
});

export { demandRoutes };
