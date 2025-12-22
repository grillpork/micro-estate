import { create } from "zustand";
import type { Message, ConversationPreview } from "@/types";

interface ChatState {
  // Conversations
  conversations: ConversationPreview[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;

  // UI State
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;

  // Actions
  setConversations: (conversations: ConversationPreview[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
  ) => void;
  markAsRead: (conversationId: string) => void;

  // Loading states
  setLoadingConversations: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  setSending: (sending: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];

      // Check if message already exists (prevent duplicates)
      const isDuplicate = existingMessages.some((m) => m.id === message.id);
      if (isDuplicate) {
        return state; // Don't add duplicate
      }

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, message],
        },
        // Update conversation preview
        conversations: state.conversations.map((conv) =>
          conv.partnerId === conversationId
            ? {
                ...conv,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
              }
            : conv
        ),
      };
    }),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  markAsRead: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.partnerId === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    })),

  setLoadingConversations: (isLoadingConversations) =>
    set({ isLoadingConversations }),

  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),

  setSending: (isSending) => set({ isSending }),

  reset: () => set(initialState),
}));
