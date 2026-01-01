import api from "../api/api";
import { User } from "../social/social.service";

// Reuse User interface from social, but define localized types for clarity

export interface ShortVideo {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  description: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  user: User;
  isLiked: boolean;
  isFollowing: boolean;
}

export interface ShortComment {
  id: string;
  videoId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: User;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const shortsService = {
  getFeed: async (limit = 10, offset = 0) => {
    const response = await api.get<ApiResponse<ShortVideo[]>>("/shorts/feed", {
      params: { limit, offset },
    });
    return response.data;
  },

  createShort: async (
    videoUrl: string,
    description?: string,
    thumbnailUrl?: string
  ) => {
    const response = await api.post<ApiResponse<ShortVideo>>("/shorts", {
      videoUrl,
      description,
      thumbnailUrl,
    });
    return response.data;
  },

  deleteShort: async (id: string) => {
    return api.delete(`/shorts/${id}`);
  },

  toggleLike: async (id: string) => {
    const response = await api.post<ApiResponse<{ isLiked: boolean }>>(
      `/shorts/${id}/like`
    );
    return response.data;
  },

  toggleFollow: async (userId: string) => {
    const response = await api.post<ApiResponse<{ isFollowing: boolean }>>(
      `/shorts/follow/${userId}`
    );
    return response.data;
  },

  getComments: async (id: string) => {
    const response = await api.get<ApiResponse<ShortComment[]>>(
      `/shorts/${id}/comments`
    );
    return response.data;
  },

  addComment: async (id: string, content: string) => {
    const response = await api.post<ApiResponse<ShortComment>>(
      `/shorts/${id}/comments`,
      { content }
    );
    return response.data;
  },
};
