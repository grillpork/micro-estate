"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/stores/useChatStore";
import { useSession } from "@/lib/auth-client";
import { socketService } from "@/lib/socket";
import { WS_MESSAGE_TYPES } from "@/types/chat"; // I'll need to define this or just use strings
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function MiniChatTrigger() {
  const { data: session } = useSession();
  const { isOpen, setIsOpen, fetchConversations, addMessage, conversations } =
    useChatStore();
  const unreadTotal = conversations.reduce(
    (acc, conv) => acc + conv.unreadCount,
    0
  );

  useEffect(() => {
    if (session?.user) {
      console.log("🗣️ [Chat] Session active, connecting socket...");
      fetchConversations();

      // Connect to WS - cookies handle auth
      socketService.connect("session");

      const handleMessage = (payload: any) => {
        console.log("📩 [Chat] New message received via socket:", payload);
        addMessage(payload.conversationId, payload.message);
      };

      socketService.on(WS_MESSAGE_TYPES.CHAT_MESSAGE, handleMessage);

      return () => {
        console.log("🗣️ [Chat] Component cleanup, removing listeners");
        socketService.off(WS_MESSAGE_TYPES.CHAT_MESSAGE, handleMessage);
      };
    }
  }, [session?.user?.id, fetchConversations, addMessage]);

  if (!session) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-zinc-800 transition-colors group"
      >
        <div className="relative">
          <Send className="w-5 h-5 -rotate-12 group-hover:rotate-0 transition-transform" />
          {unreadTotal > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-zinc-900">
              {unreadTotal}
            </span>
          )}
        </div>
        <span className="font-semibold text-sm">ข้อความ</span>

        {/* Avatars Stack (Instagram Style) */}
        <div className="flex -space-x-2 ml-2">
          {conversations.slice(0, 3).map((conv, i) => (
            <div
              key={conv.partnerId}
              className="w-6 h-6 rounded-full border-2 border-zinc-900 overflow-hidden bg-zinc-700"
              style={{ zIndex: 3 - i }}
            >
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={conv.partnerImage || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="text-[8px]">
                  {conv.partnerName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>
      </motion.button>
    </div>
  );
}
