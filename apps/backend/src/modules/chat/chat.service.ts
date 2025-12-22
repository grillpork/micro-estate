import { eq, and, or, desc, lt, sql, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db";
import { messages, users } from "../../db/schema";
import { connectionManager, WS_MESSAGE_TYPES } from "../../lib/websocket";
import type { SendMessageInput, GetMessagesInput } from "./chat.schema";

// ===== Types =====
export interface MessageWithSender {
  id: string;
  content: string | null;
  imageUrls: string[] | null;
  isRead: boolean;
  createdAt: Date;
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

export interface ConversationPreview {
  partnerId: string;
  partnerName: string | null;
  partnerImage: string | null;
  lastMessage: string | null;
  lastMessageAt: Date;
  unreadCount: number;
  isOnline: boolean;
}

// ===== Send Message =====
export async function sendMessage(
  senderId: string,
  input: SendMessageInput
): Promise<MessageWithSender> {
  const id = nanoid();

  // Create message
  const [message] = await db
    .insert(messages)
    .values({
      id,
      senderId,
      receiverId: input.receiverId,
      content: input.content || null,
      imageUrls: input.imageUrls ? JSON.stringify(input.imageUrls) : null,
      isRead: false,
    })
    .returning();

  // Get sender and receiver info
  const [sender] = await db
    .select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, senderId));

  const [receiver] = await db
    .select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, input.receiverId));

  const messageWithSender: MessageWithSender = {
    id: message.id,
    content: message.content,
    imageUrls: message.imageUrls ? JSON.parse(message.imageUrls) : null,
    isRead: message.isRead,
    createdAt: message.createdAt,
    sender,
    receiver,
  };

  // Create message for frontend (with senderId for UI rendering)
  const messageForFrontend = {
    id: message.id,
    senderId: senderId,
    content: message.content,
    imageUrls: message.imageUrls ? JSON.parse(message.imageUrls) : null,
    isRead: message.isRead,
    createdAt: message.createdAt,
    sender,
    receiver,
  };

  // Send via WebSocket to receiver with proper format
  connectionManager.sendToUser(input.receiverId, {
    type: WS_MESSAGE_TYPES.CHAT_MESSAGE,
    payload: {
      conversationId: senderId, // The sender is the conversation partner for receiver
      message: messageForFrontend,
    },
  });

  // Also send to sender (for multi-device sync)
  connectionManager.sendToUser(senderId, {
    type: WS_MESSAGE_TYPES.CHAT_MESSAGE,
    payload: {
      conversationId: input.receiverId, // The receiver is the conversation partner for sender
      message: messageForFrontend,
    },
  });

  return messageWithSender;
}

// ===== Get Messages =====
export async function getMessages(
  userId: string,
  input: GetMessagesInput
): Promise<MessageWithSender[]> {
  const { partnerId, cursor, limit } = input;

  let query = db
    .select({
      id: messages.id,
      content: messages.content,
      imageUrls: messages.imageUrls,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
      senderId: messages.senderId,
      receiverId: messages.receiverId,
    })
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId), eq(messages.receiverId, partnerId)),
        and(eq(messages.senderId, partnerId), eq(messages.receiverId, userId))
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  if (cursor) {
    // Get cursor message timestamp
    const [cursorMessage] = await db
      .select({ createdAt: messages.createdAt })
      .from(messages)
      .where(eq(messages.id, cursor));

    if (cursorMessage) {
      query = db
        .select({
          id: messages.id,
          content: messages.content,
          imageUrls: messages.imageUrls,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
        })
        .from(messages)
        .where(
          and(
            or(
              and(
                eq(messages.senderId, userId),
                eq(messages.receiverId, partnerId)
              ),
              and(
                eq(messages.senderId, partnerId),
                eq(messages.receiverId, userId)
              )
            ),
            lt(messages.createdAt, cursorMessage.createdAt)
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit);
    }
  }

  const rawMessages = await query;

  // Get user info
  const userIds = [
    ...new Set(rawMessages.flatMap((m) => [m.senderId, m.receiverId])),
  ];
  const usersData = await db
    .select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(inArray(users.id, userIds));

  const userMap = new Map(usersData.map((u) => [u.id, u]));

  // Map and reverse to get oldest first (for chat UI)
  const mappedMessages = rawMessages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    content: m.content,
    imageUrls: m.imageUrls ? JSON.parse(m.imageUrls) : null,
    isRead: m.isRead,
    createdAt: m.createdAt,
    sender: userMap.get(m.senderId) || {
      id: m.senderId,
      name: null,
      image: null,
    },
    receiver: userMap.get(m.receiverId) || {
      id: m.receiverId,
      name: null,
      image: null,
    },
  }));

  // Reverse so oldest messages are first (top) and newest are last (bottom)
  return mappedMessages.reverse();
}

// ===== Mark Messages as Read =====
export async function markMessagesAsRead(
  userId: string,
  messageIds: string[]
): Promise<void> {
  // Only mark messages where user is the receiver
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(inArray(messages.id, messageIds), eq(messages.receiverId, userId))
    );

  // Get sender IDs to notify
  const readMessages = await db
    .select({ id: messages.id, senderId: messages.senderId })
    .from(messages)
    .where(inArray(messages.id, messageIds));

  // Notify senders that messages were read
  const senderIds = [...new Set(readMessages.map((m) => m.senderId))];
  senderIds.forEach((senderId) => {
    connectionManager.sendToUser(senderId, {
      type: WS_MESSAGE_TYPES.CHAT_READ,
      payload: {
        messageIds: readMessages
          .filter((m) => m.senderId === senderId)
          .map((m) => m.id),
        readBy: userId,
      },
    });
  });
}

// ===== Get Conversations =====
export async function getConversations(
  userId: string
): Promise<ConversationPreview[]> {
  // Get all unique conversation partners
  const sentMessages = db
    .selectDistinct({ partnerId: messages.receiverId })
    .from(messages)
    .where(eq(messages.senderId, userId));

  const receivedMessages = db
    .selectDistinct({ partnerId: messages.senderId })
    .from(messages)
    .where(eq(messages.receiverId, userId));

  const partnerIds = [
    ...(await sentMessages).map((m) => m.partnerId),
    ...(await receivedMessages).map((m) => m.partnerId),
  ];
  const uniquePartnerIds = [...new Set(partnerIds)];

  const conversations: ConversationPreview[] = [];

  for (const partnerId of uniquePartnerIds) {
    // Get partner info
    const [partner] = await db
      .select({ id: users.id, name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, partnerId));

    if (!partner) continue;

    // Get last message
    const [lastMessage] = await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, userId),
            eq(messages.receiverId, partnerId)
          ),
          and(eq(messages.senderId, partnerId), eq(messages.receiverId, userId))
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(1);

    // Get unread count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.senderId, partnerId),
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );

    // Get online status
    const isOnline = connectionManager.isConnected(partnerId);

    conversations.push({
      partnerId: partner.id,
      partnerName: partner.name,
      partnerImage: partner.image,
      lastMessage:
        lastMessage?.content || (lastMessage?.imageUrls ? "📷 Image" : null),
      lastMessageAt: lastMessage?.createdAt || new Date(),
      unreadCount: Number(count),
      isOnline,
    });
  }

  // Sort by last message time
  return conversations.sort(
    (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  );
}

// ===== Get Unread Count =====
export async function getUnreadCount(userId: string): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));

  return Number(count);
}

// ===== Send Typing Indicator =====
export function sendTypingIndicator(
  senderId: string,
  senderName: string,
  receiverId: string,
  isTyping: boolean
) {
  connectionManager.sendToUser(receiverId, {
    type: isTyping
      ? WS_MESSAGE_TYPES.CHAT_TYPING
      : WS_MESSAGE_TYPES.CHAT_STOP_TYPING,
    payload: { userId: senderId, userName: senderName },
  });
}

// ===== Mark Conversation as Read =====
export async function markConversationAsRead(
  userId: string,
  partnerId: string
): Promise<number> {
  // Get all unread messages from this partner
  const unreadMessages = await db
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.senderId, partnerId),
        eq(messages.receiverId, userId),
        eq(messages.isRead, false)
      )
    );

  if (unreadMessages.length === 0) {
    return 0;
  }

  const messageIds = unreadMessages.map((m) => m.id);

  // Mark all as read
  await db
    .update(messages)
    .set({ isRead: true })
    .where(inArray(messages.id, messageIds));

  // Notify the partner that messages were read
  connectionManager.sendToUser(partnerId, {
    type: WS_MESSAGE_TYPES.CHAT_READ,
    payload: {
      messageIds,
      readBy: userId,
    },
  });

  return messageIds.length;
}
