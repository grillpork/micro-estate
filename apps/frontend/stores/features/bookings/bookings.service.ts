/**
 * Bookings Service
 * Handles API calls for property bookings
 */
import { api } from "../api/api";
import type { Booking } from "@/types/booking";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const bookingsService = {
  /**
   * Get my bookings (as a buyer)
   */
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>("/bookings/my");
    return response.data.data;
  },

  /**
   * Get agent bookings (as an agent)
   */
  getAgentBookings: async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>("/bookings/agent");
    return response.data.data;
  },

  /**
   * Update booking status
   */
  updateStatus: async (id: string, status: string): Promise<Booking> => {
    const response = await api.patch<ApiResponse<Booking>>(
      `/bookings/${id}/status`,
      {
        status,
      }
    );
    return response.data.data;
  },
};

export default bookingsService;
