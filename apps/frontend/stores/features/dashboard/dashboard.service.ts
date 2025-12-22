/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */
import api from "../api/api";

export interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
  pendingRequests: number;
  matchedDemands: number;
  totalRevenue: number;
}

export interface RecentActivity {
  id: string;
  type: "view" | "inquiry" | "match";
  message: string;
  createdAt: string;
  propertyId?: string;
  propertyTitle?: string;
}

export interface DashboardProperty {
  id: string;
  title: string;
  price: number;
  status: string;
  views: number;
  inquiries: number;
  thumbnail?: string;
}

export interface AgentDashboardData {
  stats: DashboardStats;
  properties: DashboardProperty[];
  recentActivity: RecentActivity[];
}

// Backend response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const dashboardService = {
  /**
   * Get full dashboard data (stats + properties + activity)
   */
  getAll: async (): Promise<AgentDashboardData> => {
    const response =
      await api.get<ApiResponse<AgentDashboardData>>("/dashboard");
    return response.data.data;
  },

  /**
   * Get dashboard stats only
   */
  getStats: async (): Promise<DashboardStats> => {
    const response =
      await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
    return response.data.data;
  },

  /**
   * Get agent's properties for dashboard
   */
  getProperties: async (limit: number = 5): Promise<DashboardProperty[]> => {
    const response = await api.get<ApiResponse<DashboardProperty[]>>(
      "/dashboard/properties",
      {
        params: { limit },
      }
    );
    return response.data.data;
  },

  /**
   * Get recent activity
   */
  getActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await api.get<ApiResponse<RecentActivity[]>>(
      "/dashboard/activity",
      {
        params: { limit },
      }
    );
    return response.data.data;
  },

  /**
   * Get matched demands count
   */
  getMatchedDemandsCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ count: number }>>(
      "/dashboard/matched-demands"
    );
    return response.data.data.count;
  },
};

export default dashboardService;
