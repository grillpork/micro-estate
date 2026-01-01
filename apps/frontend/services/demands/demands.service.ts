/**
 * Demands Service
 * Handles all demand-related API calls
 */
import api from "../api/api";

// ===== Types =====
export type DemandIntent = "buy" | "rent";
export type DemandUrgency = "urgent" | "normal" | "not_rush";
export type DemandStatus = "active" | "matched" | "closed" | "expired";

export interface Demand {
  id: string;
  userId: string;
  intent: DemandIntent;
  propertyType: string;
  budgetMin?: string | null;
  budgetMax?: string | null;
  province?: string | null;
  district?: string | null;
  subDistrict?: string | null;
  nearBts?: string | null;
  nearMrt?: string | null;
  bedroomsMin?: number | null;
  bedroomsMax?: number | null;
  bathroomsMin?: number | null;
  areaMin?: string | null;
  areaMax?: string | null;
  description?: string | null;
  summary?: string | null;
  tags?: string[];
  urgency: DemandUrgency;
  isPublic: boolean;
  maxAgents: number;
  status: DemandStatus;
  readinessScore?: number | null;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
}

export interface CreateDemandInput {
  intent: DemandIntent;
  propertyType: string;
  budgetMin?: number;
  budgetMax?: number;
  province?: string;
  district?: string;
  subDistrict?: string;
  nearBts?: string;
  nearMrt?: string;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  areaMin?: number;
  areaMax?: number;
  description?: string;
  tags?: string[];
  urgency?: DemandUrgency;
  isPublic?: boolean;
  maxAgents?: number;
}

export interface DemandStats {
  total: number;
  active: number;
  matched: number;
  closed: number;
  remainingSlots: number;
}

// Backend response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ===== Matching Types =====
export interface DemandMatchResult {
  id: string;
  demandId: string;
  propertyId: string;
  score: number;
  explanation: string;
  metadata?: any;
  isViewed: boolean;
  isSaved: boolean;
  isContacted: boolean;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    description: string;
    price: string;
    images: { url: string }[];
    bedrooms: number;
    bathrooms: number;
    area: string;
    province: string;
    district: string;
    subDistrict: string;
  };
}

export interface MatchResponse {
  matches: DemandMatchResult[];
  recommendations: DemandMatchResult[]; // New field for relaxed matches
  total: number;
}

export const demandsService = {
  /**
   * Create a new demand
   */
  create: async (data: CreateDemandInput): Promise<Demand> => {
    const response = await api.post<ApiResponse<Demand>>("/demands", data);
    return response.data;
  },

  /**
   * Get user's demands
   */
  getMine: async (): Promise<Demand[]> => {
    const response = await api.get<ApiResponse<Demand[]>>("/demands/my");
    return response.data;
  },

  /**
   * Get all public demands (for agents/admins)
   */
  getAll: async (
    query?: any
  ): Promise<{
    data: Demand[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await api.get<
      ApiResponse<{
        data: Demand[];
        total: number;
        page: number;
        limit: number;
      }>
    >("/demands/public", { params: query });
    return response.data;
  },

  /**
   * Get user's demand statistics
   */
  getMyStats: async (): Promise<DemandStats> => {
    const response =
      await api.get<ApiResponse<DemandStats>>("/demands/my/stats");
    return response.data;
  },

  /**
   * Get a single demand by ID
   */
  getById: async (id: string): Promise<Demand> => {
    const response = await api.get<ApiResponse<Demand>>(`/demands/${id}`);
    return response.data;
  },

  /**
   * Update a demand
   */
  update: async (
    id: string,
    data: Partial<CreateDemandInput>
  ): Promise<Demand> => {
    const response = await api.put<ApiResponse<Demand>>(`/demands/${id}`, data);
    return response.data;
  },

  /**
   * Close a demand
   */
  close: async (id: string): Promise<Demand> => {
    const response = await api.post<ApiResponse<Demand>>(
      `/demands/${id}/close`
    );
    return response.data;
  },

  /**
   * Delete a demand
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/demands/${id}`);
  },

  /**
   * Get matches for a demand
   */
  getMatches: async (id: string): Promise<MatchResponse> => {
    const response = await api.get<ApiResponse<MatchResponse>>(
      `/demands/${id}/matches`
    );
    return response.data;
  },

  /**
   * Refresh matches for a demand (force re-matching)
   */
  refreshMatches: async (
    id: string
  ): Promise<{ matchCount: number; matches: DemandMatchResult[] }> => {
    const response = await api.post<
      ApiResponse<{ matchCount: number; matches: DemandMatchResult[] }>
    >(`/demands/${id}/matches/refresh`);
    return response.data;
  },

  /**
   * Update match status (viewed, saved, contacted)
   */
  updateMatchStatus: async (
    matchId: string,
    status: {
      isViewed?: boolean;
      isSaved?: boolean;
      isContacted?: boolean;
    }
  ): Promise<DemandMatchResult> => {
    const response = await api.patch<ApiResponse<DemandMatchResult>>(
      `/demands/matches/${matchId}`,
      status
    );
    return response.data;
  },
};

export default demandsService;
