"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  Maximize2,
  MoreVertical,
  Image as ImageIcon,
  Mic,
  Smile,
  Send,
  Search,
  MessageSquare,
} from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { chatService } from "@/services/chat.service";
import { userService } from "@/services/user.service";
import { useDebounce } from "../../../hooks/use-debounce";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export function MiniChatWindow() {
  const { data: session } = useSession();
  const {
    isOpen,
    setIsOpen,
    activePartnerId,
    setActivePartnerId,
    conversations,
    messages,
    addMessage,
    fetchConversations,
  } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = activePartnerId ? messages[activePartnerId] || [] : [];
  const activeConversation = conversations.find(
    (c) => c.partnerId === activePartnerId
  );

  useEffect(() => {
    if (isOpen && !activePartnerId) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await userService.searchUsers(debouncedSearchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [debouncedSearchQuery]);

  const handleStartChat = (user: any) => {
    // Check if conversation already exists in store
    const existing = conversations.find((c) => c.partnerId === user.id);
    if (!existing) {
      // We could add a temporary conversation object to the store here
      // but for now let's just set the activePartnerId
      // and the store will handle fetching messages
    }
    setActivePartnerId(user.id);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activePartnerId) return;

    try {
      const msg = await chatService.sendMessage(activePartnerId, inputText);
      // Add message optimistically to the store
      addMessage(activePartnerId, msg);
      setInputText("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-24 right-6 z-50 w-[380px] h-[550px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            {activePartnerId ? (
              <>
                <button
                  onClick={() => setActivePartnerId(null)}
                  className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${activePartnerId}`}
                    className="relative group/avatar"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={activeConversation?.partnerImage || undefined}
                        alt=""
                      />
                      <AvatarFallback>
                        {activeConversation?.partnerName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {activeConversation?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-950 rounded-full" />
                    )}
                  </Link>
                  <div>
                    <Link
                      href={`/profile/${activePartnerId}`}
                      className="hover:underline"
                    >
                      <h4 className="text-sm font-semibold leading-tight">
                        {activeConversation?.partnerName || "User"}
                      </h4>
                    </Link>
                    <span className="text-[10px] text-zinc-400">
                      {activeConversation?.isOnline ? "Active now" : "Offline"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <h3 className="font-bold text-lg">Messages</h3>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!activePartnerId ? (
            /* Conversation List */
            <div className="divide-y divide-zinc-900">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search people"
                    className="w-full bg-zinc-900 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-zinc-700"
                  />
                </div>
              </div>

              {searchQuery.length > 0 ? (
                /* Search Results */
                <div className="divide-y divide-zinc-900 overflow-y-auto max-h-[400px]">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-zinc-500">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-900 transition-colors text-left">
                        <Link href={`/profile/${user.id}`}>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback>
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <button
                          onClick={() => handleStartChat(user)}
                          className="flex-1 text-left"
                        >
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            {user.email || "User"}
                          </p>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-zinc-500">
                      No users found
                    </div>
                  )}
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setActivePartnerId(conv.partnerId)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-900 transition-colors text-left group"
                  >
                    <div className="relative shrink-0">
                      <Link href={`/profile/${conv.partnerId}`}>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conv.partnerImage || undefined} />
                          <AvatarFallback>
                            {conv.partnerName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zinc-950 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm truncate">
                          {conv.partnerName}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), {
                            addSuffix: false,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-xs truncate max-w-[180px]",
                            conv.unreadCount > 0
                              ? "text-white font-bold"
                              : "text-zinc-500"
                          )}
                        >
                          {conv.lastMessage || "No messages yet"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-blue-600 text-[10px] h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full font-bold">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full pt-10 text-zinc-500">
                  <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm">No messages yet</p>
                </div>
              )}
            </div>
          ) : (
            /* Chat Messages */
            <div className="p-4 space-y-4">
              {activeMessages.map((msg, idx) => {
                const isMe = msg.senderId === session?.user?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2",
                      isMe ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {!isMe && (
                      <Link href={`/profile/${msg.sender.id}`}>
                        <Avatar className="w-6 h-6 mb-1">
                          <AvatarImage src={msg.sender.image || undefined} />
                          <AvatarFallback>
                            {msg.sender.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] space-y-1",
                        isMe ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "px-3 py-2 rounded-2xl text-sm wrap-break-word",
                          isMe
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-zinc-800 text-zinc-100 rounded-bl-none"
                        )}
                      >
                        {msg.content}
                      </div>
                      {/* Optional: Add hearts/reactions here */}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        {activePartnerId && (
          <div className="p-4 bg-zinc-950 border-t border-zinc-800">
            <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-4 py-2 ring-1 ring-zinc-800 focus-within:ring-zinc-700 transition-shadow">
              <Smile className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Message..."
                className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder:text-zinc-500"
              />
              {inputText.trim() ? (
                <button
                  onClick={handleSendMessage}
                  className="text-blue-500 font-bold text-sm hover:text-blue-400 transition-colors"
                >
                  Send
                </button>
              ) : (
                <div className="flex items-center gap-3 text-zinc-400">
                  <Mic className="w-5 h-5 cursor-pointer hover:text-white" />
                  <ImageIcon className="w-5 h-5 cursor-pointer hover:text-white" />
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
