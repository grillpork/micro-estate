/**
 * Chat Store
 * Manages chat state with Zustand
 */
import { create } from "zustand";
import type { Message, ConversationPreview } from "@/types";

interface ChatState {
  conversations: ConversationPreview[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;

  // Actions
  setConversations: (conversations: ConversationPreview[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  markAsRead: (conversationId: string) => void;
  setLoadingConversations: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  reset: () => void;
}

const initialState = {
  conversations: [] as ConversationPreview[],
  activeConversationId: null as string | null,
  messages: {} as Record<string, Message[]>,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  setConversations: (conversations) => {
    set({ conversations });
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
  },

  setMessages: (conversationId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    }));
  },

  addMessage: (conversationId, message) => {
    set((state) => {
      const currentMessages = state.messages[conversationId] || [];
      // Prevent duplicate messages
      if (currentMessages.some((m) => m.id === message.id)) {
        return state;
      }

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...currentMessages, message],
        },
        conversations: state.conversations.map((conv) =>
          conv.partnerId === conversationId
            ? {
                ...conv,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                unreadCount:
                  state.activeConversationId === conversationId
                    ? 0
                    : conv.unreadCount + 1,
              }
            : conv
        ),
      };
    });
  },

  removeMessage: (conversationId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (m) => m.id !== messageId
        ),
      },
    }));
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.partnerId === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    }));
  },

  setLoadingConversations: (loading) => {
    set({ isLoadingConversations: loading });
  },

  setLoadingMessages: (loading) => {
    set({ isLoadingMessages: loading });
  },

  setSending: (sending) => {
    set({ isSending: sending });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors
export const useActiveConversation = () =>
  useChatStore((state) => {
    const activeId = state.activeConversationId;
    return activeId
      ? state.conversations.find((c) => c.partnerId === activeId)
      : null;
  });

export const useConversationsList = () =>
  useChatStore((state) => state.conversations);

export const useTotalUnreadCount = () =>
  useChatStore((state) =>
    state.conversations.reduce((total, conv) => total + conv.unreadCount, 0)
  );
