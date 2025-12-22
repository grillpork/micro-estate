"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Navbar } from "@/components/layout";
import { ChatWindow } from "@/components/chat";
import { Button, Badge } from "@/components/ui";
import { useSession, api } from "@/services";
import { ArrowLeft, MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";
import type { Message } from "@/types";

// AI Assistant recipient
const AI_ASSISTANT = {
  id: "ai-assistant",
  name: "AI Assistant",
  isBot: true,
};

export default function AIMessagesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAgentPrompt, setShowAgentPrompt] = useState(false);
  const [matchedAgents, setMatchedAgents] = useState<
    { id: string; name: string }[]
  >([]);

  const handleSendMessage = useCallback(
    async (content: string, images?: File[]) => {
      if (!session?.user) return;

      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        conversationId: "ai",
        senderId: session.user.id,
        content,
        imageUrls: null,
        isRead: true,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Show typing indicator
      setIsTyping(true);

      try {
        // Call RAG API
        // Call RAG API
        const response = await api.post<{
          success: boolean;
          data: {
            reply: string;
            matchedProperties?: unknown[];
            suggestAgent?: boolean;
            agents?: { id: string; name: string }[];
          };
        }>("/chat/ai", {
          message: content,
          conversationHistory: messages.map((m) => ({
            role: m.senderId === session.user.id ? "user" : "assistant",
            content: m.content,
          })),
        });

        const aiResponseData = response.data.data;

        // Add AI response
        const aiMessage: Message = {
          id: uuidv4(),
          conversationId: "ai",
          senderId: AI_ASSISTANT.id,
          content: aiResponseData.reply,
          imageUrls: null,
          isRead: true,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Check if AI suggests talking to agent
        if (aiResponseData.suggestAgent && aiResponseData.agents) {
          setMatchedAgents(aiResponseData.agents);
          setShowAgentPrompt(true);
        }
      } catch (error) {
        console.error("Failed to get AI response:", error);
        // Add error message
        const errorMessage: Message = {
          id: uuidv4(),
          conversationId: "ai",
          senderId: AI_ASSISTANT.id,
          content: "ขออภัยค่ะ เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
          imageUrls: null,
          isRead: true,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [session, messages]
  );

  const handleConnectToAgent = async (agentId: string) => {
    try {
      // Create or get conversation with agent
      const response = await api.post<{ conversationId: string }>(
        "/conversations",
        {
          participantId: agentId,
        }
      );
      router.push(`/messages?id=${response.data.conversationId}`);
    } catch (error) {
      console.error("Failed to connect to agent:", error);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <Navbar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 border-b px-4 py-3">
          <Link href="/messages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">
              ถามเกี่ยวกับอสังหาริมทรัพย์ได้เลยค่ะ
            </p>
          </div>
        </div>

        {/* Chat */}
        <ChatWindow
          messages={messages}
          currentUserId={session?.user?.id || ""}
          recipient={AI_ASSISTANT}
          isLoading={isLoading}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          className="flex-1"
        />

        {/* Agent Prompt Modal */}
        {showAgentPrompt && matchedAgents.length > 0 && (
          <div className="border-t bg-card p-4">
            <div className="mx-auto max-w-lg space-y-3 rounded-lg border bg-background p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">ต้องการคุยกับตัวแทนไหมคะ?</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                เราพบตัวแทนที่เหมาะสมกับความต้องการของคุณ
                ต้องการติดต่อเพื่อสอบถามเพิ่มเติมไหมคะ?
              </p>
              <div className="flex flex-wrap gap-2">
                {matchedAgents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnectToAgent(agent.id)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {agent.name}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowAgentPrompt(false)}
              >
                ยังไม่ตอนนี้
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
