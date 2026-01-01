import { create } from "zustand";
import { Conversation, Message, chatService } from "@/services/chat.service";
import { socketService } from "@/lib/socket";

interface ChatState {
  isOpen: boolean;
  conversations: Conversation[];
  activePartnerId: string | null;
  messages: Record<string, Message[]>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;

  setIsOpen: (isOpen: boolean) => void;
  setActivePartnerId: (partnerId: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (partnerId: string) => Promise<void>;
  addMessage: (partnerId: string, message: Message) => void;
  setConversations: (conversations: Conversation[]) => void;
  markAsRead: (partnerId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  conversations: [],
  activePartnerId: null,
  messages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,

  setIsOpen: (isOpen) => set({ isOpen }),

  setActivePartnerId: (partnerId) => {
    set({ activePartnerId: partnerId });
    if (partnerId) {
      get().fetchMessages(partnerId);
      get().markAsRead(partnerId);
    }
  },

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const conversations = await chatService.getConversations();
      set({ conversations });
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  fetchMessages: async (partnerId) => {
    set({ isLoadingMessages: true });
    try {
      const messages = await chatService.getMessages(partnerId);
      set((state) => ({
        messages: {
          ...state.messages,
          [partnerId]: messages,
        },
      }));
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  addMessage: (partnerId, message) => {
    set((state) => {
      const partnerMessages = state.messages[partnerId] || [];

      // Avoid duplicates
      if (partnerMessages.some((m) => m.id === message.id)) {
        return state;
      }

      // Update conversations list to bubble up the active one
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.partnerId === partnerId) {
          return {
            ...conv,
            lastMessage: message.content || "📷 Image",
            lastMessageAt: message.createdAt,
            unreadCount:
              state.activePartnerId === partnerId ? 0 : conv.unreadCount + 1,
          };
        }
        return conv;
      });

      return {
        messages: {
          ...state.messages,
          [partnerId]: [...partnerMessages, message],
        },
        conversations: updatedConversations,
      };
    });
  },

  setConversations: (conversations) => set({ conversations }),

  markAsRead: async (partnerId) => {
    try {
      await chatService.markAsRead(partnerId);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.partnerId === partnerId ? { ...conv, unreadCount: 0 } : conv
        ),
      }));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  },
}));
