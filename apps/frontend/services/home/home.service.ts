/**
 * Home Service
 * Handles all home page related API calls
 */
import api from "../api/api";

export interface PropertyTypeCount {
  type: string;
  count: number;
}

export interface FeaturedProperty {
  id: string;
  title: string;
  slug: string;
  price: number;
  listingType: string;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  province: string | null;
  district: string | null;
  thumbnailUrl: string | null;
}

export interface HomeStats {
  totalProperties: number;
  totalUsers: number;
  verifiedAgents: number;
}

export interface HomePageData {
  stats: HomeStats;
  propertyTypeCounts: PropertyTypeCount[];
  featuredProperties: FeaturedProperty[];
}

// Backend response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const homeService = {
  /**
   * Get full home page data
   */
  getAll: async (): Promise<HomePageData> => {
    const response = await api.get<ApiResponse<HomePageData>>("/home");
    return response.data;
  },

  /**
   * Get home stats only
   */
  getStats: async (): Promise<HomeStats> => {
    const response = await api.get<ApiResponse<HomeStats>>("/home/stats");
    return response.data;
  },

  /**
   * Get property type counts
   */
  getPropertyTypeCounts: async (): Promise<PropertyTypeCount[]> => {
    const response = await api.get<ApiResponse<PropertyTypeCount[]>>(
      "/home/property-types"
    );
    return response.data;
  },

  /**
   * Get featured properties
   */
  getFeaturedProperties: async (
    limit: number = 6
  ): Promise<FeaturedProperty[]> => {
    const response = await api.get<ApiResponse<FeaturedProperty[]>>(
      "/home/featured",
      {
        params: { limit },
      }
    );
    return response.data;
  },
};

export default homeService;
