import { api } from "@/lib/api";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string | null;
  imageUrls: string[] | null;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface Conversation {
  partnerId: string;
  partnerName: string | null;
  partnerImage: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
}

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const res: any = await api.get("/chat/conversations");
    return res.data;
  },

  getMessages: async (
    partnerId: string,
    limit = 50,
    cursor?: string
  ): Promise<Message[]> => {
    const res: any = await api.get("/chat/messages", {
      params: { partnerId, limit, cursor },
    });
    return res.data;
  },

  sendMessage: async (
    receiverId: string,
    content?: string,
    imageUrls?: string[]
  ): Promise<Message> => {
    const res: any = await api.post("/chat/messages", {
      receiverId,
      content,
      imageUrls,
    });
    return res.data;
  },

  markAsRead: async (partnerId: string): Promise<void> => {
    await api.post(`/chat/conversations/${partnerId}/read`);
  },

  getUnreadCount: async (): Promise<number> => {
    const res: any = await api.get("/chat/unread-count");
    return res.data.count;
  },
};
