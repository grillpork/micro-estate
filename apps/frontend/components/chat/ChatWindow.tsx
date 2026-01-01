"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import {
  Send,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Bot,
  User as UserIcon,
  X,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Button,
  Input,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Spinner,
} from "@/components/ui";
import type { Message, User } from "@/types";
import { MessageItem } from "./MessageItem";

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  recipient?:
<<<<<<< HEAD
  | User
  | { id: string; name: string; image?: string; isBot?: boolean };
=======
    | User
    | {
        id: string;
        name: string | null;
        image?: string | null;
        isBot?: boolean;
      };
>>>>>>> 3f33e72 (feat: Add new UI components, chat features, and services, while updating admin layout, backend user service, and frontend pages.)
  isLoading?: boolean;
  isSending?: boolean;
  isTyping?: boolean;
  isRecipientOnline?: boolean;
  onSendMessage: (content: string, images?: File[]) => void;
  onDeleteMessage?: (messageId: string) => void;
  onBack?: () => void;
  className?: string;
}

export function ChatWindow({
  messages,
  currentUserId,
  recipient,
  isLoading = false,
  isSending = false,
  isTyping = false,
  isRecipientOnline = false,
  onSendMessage,
  onDeleteMessage,
  onBack,
  className,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBot = recipient
    ? "isBot" in recipient && recipient.isBot === true
    : false;

  // Scroll to bottom when messages change
  // Virtuoso handles this with followOutput="auto", but sometimes we need manual trigger
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      // Small delay to ensure rendering
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: messages.length - 1,
          align: "end",
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages.length, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && selectedImages.length === 0) return;

    onSendMessage(
      inputValue,
      selectedImages.length > 0 ? selectedImages : undefined
    );
    setInputValue("");
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...selectedImages, ...files].slice(0, 5); // Max 5 images
    setSelectedImages(newFiles);

    // Generate previews
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newFiles = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newFiles);
    setImagePreviews(newPreviews);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-background relative overflow-hidden",
        className
      )}
    >
      {/* Background Decoration */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 border-b bg-background/80 backdrop-blur-md px-4 py-3 shadow-sm">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        {recipient && (
          <>
            <div className="relative">
              <Avatar className="border-2 border-background shadow-sm">
                {isBot ? (
                  <AvatarFallback className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                ) : recipient.image ? (
                  <AvatarImage
                    src={recipient.image}
                    alt={recipient.name || ""}
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(recipient.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              {!isBot && isRecipientOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500 ring-1 ring-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">
                  {isBot ? "AI Assistant" : recipient.name || "ไม่ระบุชื่อ"}
                </p>
                {isBot && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-4 px-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0"
                  >
                    BETA
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {isBot ? (
                  <>
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>ตอบกลับทันที</span>
                  </>
                ) : isRecipientOnline ? (
                  "ออนไลน์"
                ) : (
                  "ออฟไลน์"
                )}
              </p>
            </div>

            {!isBot && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Messages Area (Virtual List) */}
      <div className="relative z-0 flex-1 p-4 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
              {isBot ? (
                <div className="relative h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl rotate-3">
                  <Bot className="h-10 w-10 text-white" />
                </div>
              ) : (
                <div className="relative h-20 w-20 flex items-center justify-center rounded-2xl bg-muted shadow-lg">
                  <MessageSquare className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-xl mb-2">
              {isBot ? "สวัสดีค่ะ! มีอะไรให้ช่วยไหมคะ?" : "เริ่มต้นการสนทนา"}
            </h3>
            <p className="text-muted-foreground max-w-sm">
              {isBot
                ? "ฉันเป็น AI ที่ได้รับการฝึกฝนมาเพื่อช่วยคุณค้นหาบ้านและตอบคำถามเกี่ยวกับอสังหาริมทรัพย์"
                : "ส่งข้อความทักทายเพื่อเริ่มการสนทนาได้เลย"}
            </p>
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            initialTopMostItemIndex={messages.length - 1}
            followOutput="auto"
            className="no-scrollbar"
            itemContent={(index, message) => {
              const showAvatar =
                index === 0 ||
                messages[index - 1].senderId !== message.senderId;

              return (
                <div className="pb-6 px-1">
                  <MessageItem
                    message={message}
                    currentUserId={currentUserId}
                    showAvatar={showAvatar}
                    recipient={recipient as any}
                    onImageClick={(url) => setShowImageModal(url)}
                    onDelete={onDeleteMessage}
                  />
                </div>
              );
            }}
            components={{
              Footer: () =>
                isTyping ? (
                  <div className="pb-6 px-1">
                    <div className="flex gap-3">
                      <Avatar className="mt-auto shadow-sm ring-2 ring-background">
                        <AvatarFallback>
                          {getInitials(recipient?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white dark:bg-zinc-800 border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                      </div>
<<<<<<< HEAD
                    )}

                    {/* Text */}
                    {message.content && (
                      <div
                        className={cn(
                          "inline-block rounded-2xl px-4 py-2 wrap-break-word max-w-[600px] text-start",
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap wrap-break-word max-w-[600px] text-start">
                          {message.content}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {formatTime(message.createdAt)}
                      {isOwn && (
                        <span className="ml-1">
                          {message.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </p>
=======
                    </div>
>>>>>>> 3f33e72 (feat: Add new UI components, chat features, and services, while updating admin layout, backend user service, and frontend pages.)
                  </div>
                ) : null,
            }}
          />
        )}
      </div>

      {/* Image Previews */}
      <div>
        {imagePreviews.length > 0 && (
          <div className="border-t bg-muted/30 px-4 py-3 backdrop-blur-sm">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative flex-shrink-0 group">
                  <img
                    src={preview}
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover shadow-sm ring-1 ring-border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-md opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 p-2 bg-muted/50 rounded-3xl border focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background shadow-sm"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:bg-muted-foreground/10 hover:text-primary h-10 w-10 flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-3 h-auto min-h-[44px] max-h-32 resize-none"
            disabled={isSending}
            autoComplete="off"
          />

          <Button
            type="submit"
            size="icon"
            className={cn(
              "rounded-full h-10 w-10 flex-shrink-0",
              inputValue.trim() || selectedImages.length > 0
                ? "bg-primary"
                : "bg-muted text-muted-foreground opacity-70"
            )}
            disabled={
              isSending || (!inputValue.trim() && selectedImages.length === 0)
            }
          >
            {isSending ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <div className="text-[10px] text-center text-muted-foreground/60 mt-2 font-light">
          กด Enter เพื่อส่งข้อความ
        </div>
      </div>

      {/* Image Modal */}
      <div>
        {showImageModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowImageModal(null)}
          >
            <button
              className="absolute right-4 top-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => setShowImageModal(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={showImageModal}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
