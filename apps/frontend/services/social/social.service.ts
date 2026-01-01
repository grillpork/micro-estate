import api from "../api/api";

export interface User {
  id: string;
  name: string;
  image: string | null;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface Post {
  id: string;
  userId: string;
  content: string | null;
  images: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  user: User;
  isLiked: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const socialService = {
  getFeed: async (limit = 20, offset = 0) => {
    const response = await api.get<ApiResponse<Post[]>>("/social/feed", {
      params: { limit, offset },
    });
    return response.data;
  },

  createPost: async (content?: string, images?: string[]) => {
    const response = await api.post<ApiResponse<Post>>("/social", {
      content,
      images,
    });
    return response.data;
  },

  deletePost: async (postId: string) => {
    return api.delete(`/social/posts/${postId}`);
  },

  toggleLike: async (postId: string) => {
    const response = await api.post<ApiResponse<{ isLiked: boolean }>>(
      `/social/posts/${postId}/like`
    );
    return response.data;
  },

  getComments: async (postId: string) => {
    const response = await api.get<ApiResponse<Comment[]>>(
      `/social/posts/${postId}/comments`
    );
    return response.data;
  },

  addComment: async (postId: string, content: string) => {
    const response = await api.post<ApiResponse<Comment>>(
      `/social/posts/${postId}/comments`,
      { content }
    );
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    return api.delete(`/social/comments/${commentId}`);
  },
};
