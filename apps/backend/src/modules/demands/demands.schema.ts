import { z } from "zod";
import {
  PROPERTY_TYPE,
  DEMAND_INTENT,
  DEMAND_URGENCY,
  DEMAND_STATUS,
  DEMAND_LIMITS,
  PAGINATION,
} from "../../shared/constants";

// ===== Create Demand Schema =====
export const createDemandSchema = z.object({
  // Required fields
  intent: z.enum(Object.values(DEMAND_INTENT) as [string, ...string[]]),
  propertyType: z.enum(Object.values(PROPERTY_TYPE) as [string, ...string[]]),

  // Budget (at least one should be provided for good matching)
  budgetMin: z.coerce.number().positive().optional(),
  budgetMax: z.coerce.number().positive().optional(),

  // Location
  province: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  nearBts: z.string().min(1).optional(),
  nearMrt: z.string().min(1).optional(),

  // Requirements
  bedroomsMin: z.coerce.number().int().min(0).optional(),
  bedroomsMax: z.coerce.number().int().min(0).optional(),
  bathroomsMin: z.coerce.number().int().min(0).optional(),
  areaMin: z.coerce.number().positive().optional(),
  areaMax: z.coerce.number().positive().optional(),

  // Free-text description
  description: z.string().max(2000).optional(),

  // Tags (will be validated against DEMAND_TAGS in service)
  tags: z.array(z.string()).max(DEMAND_LIMITS.MAX_TAGS).optional(),

  // Settings
  urgency: z
    .enum(Object.values(DEMAND_URGENCY) as [string, ...string[]])
    .default("normal"),
  isPublic: z.boolean().default(true),
  maxAgents: z.coerce
    .number()
    .int()
    .min(1)
    .max(DEMAND_LIMITS.MAX_AGENTS_PER_DEMAND)
    .default(DEMAND_LIMITS.MAX_AGENTS_PER_DEMAND),
});

// ===== Update Demand Schema =====
export const updateDemandSchema = createDemandSchema.partial().extend({
  status: z
    .enum(Object.values(DEMAND_STATUS) as [string, ...string[]])
    .optional(),
});

// ===== Query Demands Schema =====
export const demandQuerySchema = z.object({
  // Pagination (Hybrid: page/limit or limit/offset)
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  offset: z.coerce.number().int().min(0).optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(["createdAt", "urgency", "budgetMax"]).default("createdAt"),

  // Filters (for agents to find matching demands)
  intent: z
    .enum(Object.values(DEMAND_INTENT) as [string, ...string[]])
    .optional(),
  propertyType: z
    .enum(Object.values(PROPERTY_TYPE) as [string, ...string[]])
    .optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  urgency: z
    .enum(Object.values(DEMAND_URGENCY) as [string, ...string[]])
    .optional(),
  status: z
    .enum(Object.values(DEMAND_STATUS) as [string, ...string[]])
    .optional(),

  // Budget range filter (for agents)
  minBudget: z.coerce.number().positive().optional(),
  maxBudget: z.coerce.number().positive().optional(),
});

// ===== Types =====
export type CreateDemandInput = z.infer<typeof createDemandSchema>;
export type UpdateDemandInput = z.infer<typeof updateDemandSchema>;
export type DemandQuery = z.infer<typeof demandQuerySchema>;
