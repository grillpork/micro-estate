/**
 * Notifications Service
 * Handles all notification-related API calls
 */
import api from "../api/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  hasMore: boolean;
}

export const notificationsService = {
  /**
   * Get user notifications
   */
  getAll: async (
    limit = 20,
    cursor?: string
  ): Promise<NotificationsResponse> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append("cursor", cursor);

    const response = await api.get<ApiResponse<NotificationsResponse>>(
      `/notifications?${params}`
    );
    return response.data.data || { notifications: [], hasMore: false };
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>(
        "/notifications/unread-count"
      );
      return response.data.data?.count || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Mark notifications as read
   */
  markAsRead: async (notificationIds: string[]): Promise<void> => {
    await api.post("/notifications/read", { notificationIds });
  },

  /**
   * Mark all as read
   */
  markAllAsRead: async (): Promise<void> => {
    await api.post("/notifications/read-all");
  },

  /**
   * Delete notification
   */
  delete: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};

export default notificationsService;
