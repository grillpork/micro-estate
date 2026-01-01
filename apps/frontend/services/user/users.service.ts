/**
 * Users Service
 * Handles all user-related API calls
 */
import api from "../api/api";
import type { User } from "@/types";

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  image?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface SearchUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export const usersService = {
  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/users/me");
    return response.data;
  },

  /**
   * Get user by ID (public profile)
   */
  getById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/profile/${id}`);
    return response.data;
  },

  /**
   * Search users by name or email
   */
  search: async (query: string): Promise<SearchUser[]> => {
    if (!query || query.length < 2) {
      return [];
    }
    const response = await api.get<ApiResponse<SearchUser[]>>(`/users/search`, {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.put<ApiResponse<User>>("/users/me", data);
    return response.data;
  },

  /**
   * Upload profile image
   */
  uploadProfileImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "avatar");

    const response = await api.post<ApiResponse<{ url: string }>>(
      "/media/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};

export default usersService;
