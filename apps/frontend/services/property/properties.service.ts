/**
 * Properties Service
 * Handles all property-related API calls
 */
import api from "../api/api";
import type { Property, PaginatedResponse, PropertyFormData } from "@/types";

export interface SearchPropertiesParams {
  q?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  province?: string;
  district?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sort?: "asc" | "desc";
}

// Backend response wrapper types
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const propertiesService = {
  /**
   * Get all properties with pagination
   */
  getAll: async (
    params?: SearchPropertiesParams
  ): Promise<PaginatedResponse<Property>> => {
    const response = await api.get<PaginatedApiResponse<Property>>(
      "/properties",
      {
        params,
      }
    );
    return {
      data: response.data,
      meta: response.meta,
    };
  },

  /**
   * Search properties
   */
  search: async (
    params: SearchPropertiesParams
  ): Promise<PaginatedResponse<Property>> => {
    const response = await api.get<PaginatedApiResponse<Property>>(
      "/search/properties",
      { params }
    );
    return {
      data: response.data,
      meta: response.meta,
    };
  },

  /**
   * Get a single property by ID
   */
  getById: async (id: string): Promise<Property> => {
    const response = await api.get<ApiResponse<Property>>(`/properties/${id}`);
    return response.data;
  },

  /**
   * Get a single property by slug
   */
  getBySlug: async (slug: string): Promise<Property> => {
    const response = await api.get<ApiResponse<Property>>(
      `/properties/slug/${slug}`
    );
    return response.data;
  },

  /**
   * Create a new property (agent only)
   */
  create: async (data: PropertyFormData): Promise<Property> => {
    const response = await api.post<ApiResponse<Property>>("/properties", data);
    return response.data;
  },

  /**
   * Update a property (agent only)
   */
  update: async (
    id: string,
    data: Partial<PropertyFormData>
  ): Promise<Property> => {
    const response = await api.put<ApiResponse<Property>>(
      `/properties/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a property (agent only)
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },

  /**
   * Get properties by agent
   */
  getByAgent: async (agentId: string): Promise<Property[]> => {
    const response = await api.get<ApiResponse<Property[]>>(
      `/properties/agent/${agentId}`
    );
    return response.data;
  },

  /**
   * Get my properties (current agent)
   */
  getMine: async (): Promise<Property[]> => {
    const response = await api.get<ApiResponse<Property[]>>(
      "/properties/my/listings"
    );
    return response.data;
  },

  /**
   * Increment property views
   */
  incrementViews: async (id: string): Promise<void> => {
    await api.post(`/properties/${id}/view`);
  },
};

export default propertiesService;
