"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout";
import { ChatWindow, ChatSidebar } from "@/components/chat";
import { useChatStore } from "@/stores";
import { useWebSocket, useIsMobile } from "@/hooks";
import { useSession, api, chatService, usersService } from "@/services";
import { Spinner, Button } from "@/components/ui";
import { Bot, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { ConversationPreview, Message, User } from "@/types";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");
  const { data: session, isPending: isSessionPending } = useSession();
  const isMobile = useIsMobile();

  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    setConversations,
    setActiveConversation,
    setMessages,
    addMessage,
    setLoadingConversations,
    setLoadingMessages,
    setSending,
    markAsRead,
  } = useChatStore();

  const [recipient, setRecipient] = useState<User | null>(null);

  // WebSocket connection - uses singleton manager
  // Connection is handled by WebSocketProvider automatically
  const { send, isConnected } = useWebSocket({
    onMessage: (msg) => {
      if (msg.type === "chat:message") {
        // Message will be added by the hook automatically
      }
    },
  });

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const data = await chatService.getConversations();
        setConversations(data);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        setConversations([]);
      } finally {
        setLoadingConversations(false);
      }
    };

    if (session?.user) {
      fetchConversations();
    }
  }, [session, setConversations, setLoadingConversations]);

  // Set active conversation from URL
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }
  }, [conversationId, setActiveConversation]);

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversationId) return;

      setLoadingMessages(true);
      try {
        const msgs = await chatService.getMessages(activeConversationId);
        setMessages(activeConversationId, msgs);

        // Find recipient in conversations
        const conversation = conversations.find(
          (c) => c.partnerId === activeConversationId
        );

        if (conversation) {
          setRecipient({
            id: conversation.partnerId,
            name: conversation.partnerName || "User",
            email: "",
            image: conversation.partnerImage || undefined,
          } as User);
        } else if (!recipient || recipient.id !== activeConversationId) {
          // Only fetch user details if we don't have it cached
          try {
            const user = await usersService.getById(activeConversationId);
            setRecipient(user);
          } catch (e) {
            console.error("Failed to fetch recipient details", e);
            // Set a fallback recipient with minimal info
            setRecipient({
              id: activeConversationId,
              name: "User",
              email: "",
              image: null,
              role: "user",
              phone: null,
              bio: null,
              emailVerified: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }

        // Mark as read - update UI immediately
        markAsRead(activeConversationId);

        // Then persist to backend
        try {
          await chatService.markAsRead(activeConversationId);
          send("chat:read", { conversationId: activeConversationId });
        } catch (e) {
          // Ignore mark as read errors
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  const handleSendMessage = useCallback(
    async (content: string, images?: File[]) => {
      if (!activeConversationId || !session?.user) return;

      setSending(true);
      try {
        let imageUrls: string[] = [];

        // Upload images if any
        if (images && images.length > 0) {
          imageUrls = await chatService.uploadImages(images);
        }

        // Send via WebSocket
        const sent = send("chat:message", {
          receiverId: activeConversationId,
          content,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        });

        if (!sent) {
          // Fallback to REST API
          const message = await chatService.sendMessage(
            activeConversationId,
            content,
            imageUrls
          );
          addMessage(activeConversationId, message);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setSending(false);
      }
    },
    [activeConversationId, session, send, addMessage, setSending]
  );

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    // Update URL without navigation
    window.history.pushState(null, "", `/messages?id=${id}`);
  };

  const handleBack = () => {
    setActiveConversation(null);
    window.history.pushState(null, "", "/messages");
  };

  if (isSessionPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentMessages = activeConversationId
    ? messages[activeConversationId] || []
    : [];

  const showSidebar = !isMobile || !activeConversationId;
  const showChat = !isMobile || activeConversationId;

  return (
    <div className="flex h-screen flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            isLoading={isLoadingConversations}
            className="w-full border-r md:w-80"
          />
        )}

        {/* Chat Window */}
        {showChat && (
          <>
            {activeConversationId ? (
              <ChatWindow
                messages={currentMessages}
                currentUserId={session?.user?.id || ""}
                recipient={recipient || undefined}
                isLoading={isLoadingMessages}
                isSending={isSending}
                isRecipientOnline={
                  conversations.find(
                    (c) => c.partnerId === activeConversationId
                  )?.isOnline || false
                }
                onSendMessage={handleSendMessage}
                onBack={handleBack}
                className="flex-1"
              />
            ) : (
              <div className="hidden flex-1 flex-col items-center justify-center gap-4 md:flex">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">เลือกการสนทนา</h3>
                  <p className="text-sm text-muted-foreground">
                    เลือกการสนทนาจากรายการทางซ้าย หรือเริ่มคุยกับ AI
                  </p>
                </div>
                <Link href="/messages/ai">
                  <Button>
                    <Bot className="mr-2 h-4 w-4" />
                    คุยกับ AI Assistant
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
