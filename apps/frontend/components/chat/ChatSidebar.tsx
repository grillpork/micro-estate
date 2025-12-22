"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, X, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Input,
} from "@/components/ui";
import { usersService, type SearchUser } from "@/services";
import type { ConversationPreview } from "@/types";

interface ChatSidebarProps {
  conversations: ConversationPreview[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  isLoading = false,
  className,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();

    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      return messageDate.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
      return days[messageDate.getDay()];
    }

    // Older
    return messageDate.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await usersService.search(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (user: SearchUser) => {
    onSelectConversation(user.id);
    setSearchQuery("");
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className={cn("flex flex-col bg-card", className)}>
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold text-lg">ข้อความ</h2>
      </div>

      {/* Search Input */}
      <div className="border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ค้นหาผู้ใช้งาน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <div className="border-b">
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
              ผลการค้นหา
            </div>
            {isSearching ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                ไม่พบผู้ใช้งาน
              </div>
            ) : (
              searchResults.map((user) => (
                <motion.button
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleSelectSearchResult(user)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                >
                  <Avatar size="md">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name || ""} />
                    ) : null}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.name || "ไม่ระบุชื่อ"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              ))
            )}
          </div>
        )}

        {/* Conversations List */}
        {searchQuery.length < 2 && (
          <>
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <p className="text-muted-foreground mb-2">ยังไม่มีการสนทนา</p>
                <p className="text-sm text-muted-foreground">
                  ค้นหาผู้ใช้งานเพื่อเริ่มต้นสนทนา
                </p>
              </div>
            ) : (
              conversations.map((conversation, index) => (
                <motion.button
                  key={conversation.partnerId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectConversation(conversation.partnerId)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
                    activeConversationId === conversation.partnerId &&
                      "bg-accent"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar size="md">
                      {conversation.partnerImage ? (
                        <AvatarImage
                          src={conversation.partnerImage}
                          alt={conversation.partnerName || ""}
                        />
                      ) : null}
                      <AvatarFallback>
                        {getInitials(conversation.partnerName)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate font-medium",
                          conversation.unreadCount > 0 && "font-semibold"
                        )}
                      >
                        {conversation.partnerName || "ไม่ระบุชื่อ"}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-sm",
                          conversation.unreadCount > 0
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {conversation.lastMessage || "ยังไม่มีข้อความ"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-xs"
                        >
                          {conversation.unreadCount > 99
                            ? "99+"
                            : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
