/**
 * Chat Service
 * Handles all chat-related API calls
 */
import api from "../api/api";
import type { Message, ConversationPreview } from "@/types";

// API Response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const chatService = {
  /**
   * Get all conversations for current user
   */
  getConversations: async (): Promise<ConversationPreview[]> => {
    const response = await api.get<ApiResponse<ConversationPreview[]>>(
      "/chat/conversations"
    );
    return response.data || [];
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (
    partnerId: string,
    params?: { limit?: number; cursor?: string }
  ): Promise<Message[]> => {
    const response = await api.get<ApiResponse<Message[]>>("/chat/messages", {
      params: { ...params, partnerId },
    });
    return response.data || [];
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (conversationId: string): Promise<void> => {
    await api.post(`/chat/conversations/${conversationId}/read`);
  },

  /**
   * Upload chat images
   */
  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post<ApiResponse<{ urls: string[] }>>(
      "/media/upload/chat",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data?.urls || [];
  },

  /**
   * Send a message
   */
  sendMessage: async (
    receiverId: string,
    content?: string,
    imageUrls?: string[]
  ): Promise<Message> => {
    const response = await api.post<ApiResponse<Message>>("/chat/messages", {
      receiverId,
      content,
      imageUrls,
    });
    return response.data;
  },

  /**
   * Delete a message
   */
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/chat/messages/${messageId}`);
  },
};

export default chatService;
