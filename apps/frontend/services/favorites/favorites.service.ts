/**
 * Favorites Service
 * Handles all favorites-related API calls
 */
import api from "../api/api";
import type { Property } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
  property?: Property;
}

export const favoritesService = {
  /**
   * Get user's favorites
   */
  getAll: async (): Promise<Favorite[]> => {
    const response = await api.get<ApiResponse<Favorite[]>>("/favorites");
    return response.data || [];
  },

  /**
   * Add property to favorites
   */
  add: async (propertyId: string): Promise<Favorite> => {
    const response = await api.post<ApiResponse<Favorite>>(
      `/favorites/${propertyId}`
    );
    return response.data;
  },

  /**
   * Remove property from favorites
   */
  remove: async (propertyId: string): Promise<{ removed: boolean }> => {
    const response = await api.delete<ApiResponse<{ removed: boolean }>>(
      `/favorites/${propertyId}`
    );
    return response.data;
  },

  /**
   * Toggle favorite status
   */
  toggle: async (propertyId: string): Promise<{ favorited: boolean }> => {
    const response = await api.post<ApiResponse<{ favorited: boolean }>>(
      `/favorites/${propertyId}/toggle`
    );
    return response.data;
  },

  /**
   * Check if property is favorited
   */
  check: async (propertyId: string): Promise<boolean> => {
    try {
      const response = await api.get<ApiResponse<{ favorited: boolean }>>(
        `/favorites/${propertyId}/check`
      );
      return response.data?.favorited || false;
    } catch {
      return false;
    }
  },
};

export default favoritesService;
