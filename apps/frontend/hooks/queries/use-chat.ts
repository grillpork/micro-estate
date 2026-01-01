/**
 * Chat Queries
 * React Query hooks for chat data fetching
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat/chat.service";

// Query Keys
export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  messages: (participantId: string) =>
    [...chatKeys.all, "messages", participantId] as const,
};

/**
 * Get all conversations
 */
export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: () => chatService.getConversations(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Get messages for a conversation
 */
export function useMessages(participantId: string) {
  return useQuery({
    queryKey: chatKeys.messages(participantId),
    queryFn: () => chatService.getMessages(participantId),
    enabled: Boolean(participantId),
  });
}

/**
 * Mark messages as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatService.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

/**
 * Upload chat images
 */
export function useUploadChatImages() {
  return useMutation({
    mutationFn: (files: File[]) => chatService.uploadImages(files),
  });
}
