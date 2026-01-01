"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@/components/ui";
import { Message } from "@/types";
import { Trash2 } from "lucide-react";

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  showAvatar: boolean;
  recipient?: {
    id: string;
    name: string | null;
    image?: string;
    isBot?: boolean;
  } | null;
  onImageClick: (url: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageItem({
  message,
  currentUserId,
  showAvatar,
  recipient,
  onImageClick,
  onDelete,
}: MessageItemProps) {
  const isOwn = message.senderId === currentUserId;
  const isBot = recipient?.isBot ?? false;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={cn("flex gap-3", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <div className="shrink-0 flex flex-col justify-end">
          {showAvatar ? (
            <Avatar className="h-8 w-8 mt-1 shadow-sm ring-2 ring-background">
              {isBot ? (
                <AvatarFallback className="bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px]">
                  AI
                </AvatarFallback>
              ) : recipient?.image ? (
                <AvatarImage
                  src={recipient.image}
                  alt={recipient?.name || ""}
                />
              ) : (
                <AvatarFallback>{getInitials(recipient?.name)}</AvatarFallback>
              )}
            </Avatar>
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}

      <div
        className={cn(
          "group max-w-[75%] lg:max-w-[65%] space-y-1",
          isOwn ? "items-end flex flex-col" : "items-start flex flex-col"
        )}
      >
        {/* Images */}
        {message.imageUrls && message.imageUrls.length > 0 && (
          <div
            className={cn(
              "grid gap-1.5 overflow-hidden rounded-2xl mb-1",
              message.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            {message.imageUrls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => onImageClick(url)}
                className="relative overflow-hidden bg-muted"
                type="button"
              >
                <img
                  src={url}
                  alt=""
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10" />
              </button>
            ))}
          </div>
        )}

        {/* Text Bubbles */}
        {message.content && (
          <div
            className={cn(
              "relative px-5 py-3 shadow-sm max-w-[500px] md:max-w-[650px] lg:max-w-[800px]",
              isOwn
                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                : "bg-white dark:bg-zinc-800 border text-foreground rounded-2xl rounded-tl-sm"
            )}
          >
            <p className="text-sm md:text-base whitespace-pre-wrap wrap-break-word leading-relaxed">
              {message.content}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 px-1 transition-opacity",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && (
            <>
              <span>
                {message.isRead ? (
                  <span className="flex gap-0.5 text-primary">
                    <div className="h-1 w-1 rounded-full bg-current" />
                    <div className="h-1 w-1 rounded-full bg-current" />
                  </span>
                ) : (
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                )}
              </span>

              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 text-muted-foreground hover:text-destructive p-0 ml-1"
                  onClick={() => onDelete(message.id)}
                  title="ลบข้อความ"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
