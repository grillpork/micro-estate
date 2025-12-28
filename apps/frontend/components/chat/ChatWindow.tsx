"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Bot,
  User as UserIcon,
  X,
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

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  recipient?:
  | User
  | { id: string; name: string; image?: string; isBot?: boolean };
  isLoading?: boolean;
  isSending?: boolean;
  isTyping?: boolean;
  isRecipientOnline?: boolean;
  onSendMessage: (content: string, images?: File[]) => void;
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
  onBack,
  className,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBot = recipient
    ? "isBot" in recipient && recipient.isBot === true
    : false;

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
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
              <Avatar size="md">
                {isBot ? (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                    <Bot className="h-5 w-5 text-white" />
                  </AvatarFallback>
                ) : recipient.image ? (
                  <AvatarImage
                    src={recipient.image}
                    alt={recipient.name || ""}
                  />
                ) : (
                  <AvatarFallback>{getInitials(recipient.name)}</AvatarFallback>
                )}
              </Avatar>
              {!isBot && isRecipientOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {isBot ? "AI Assistant" : recipient.name || "ไม่ระบุชื่อ"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isBot
                  ? "พร้อมช่วยเหลือคุณ 24/7"
                  : isRecipientOnline
                    ? "ออนไลน์"
                    : "ออฟไลน์"}
              </p>
            </div>

            {!isBot && (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            {isBot ? (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">AI Assistant</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  สวัสดีค่ะ! ฉันพร้อมช่วยเหลือคุณค้นหาอสังหาริมทรัพย์ที่เหมาะสม
                  บอกความต้องการของคุณได้เลยค่ะ
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">ยังไม่มีข้อความ</p>
            )}
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const showAvatar =
                index === 0 ||
                messages[index - 1].senderId !== message.senderId;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2",
                    isOwn ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {!isOwn && showAvatar && (
                    <Avatar size="sm">
                      {isBot ? (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                          <Bot className="h-3 w-3 text-white" />
                        </AvatarFallback>
                      ) : recipient?.image ? (
                        <AvatarImage
                          src={recipient.image}
                          alt={recipient?.name || ""}
                        />
                      ) : (
                        <AvatarFallback>
                          {getInitials(recipient?.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}

                  {!isOwn && !showAvatar && <div className="w-8" />}

                  <div
                    className={cn(
                      "max-w-[70%] space-y-1",
                      isOwn ? "text-right" : "text-left"
                    )}
                  >
                    {/* Images */}
                    {message.imageUrls && message.imageUrls.length > 0 && (
                      <div
                        className={cn(
                          "grid gap-1",
                          message.imageUrls.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-2"
                        )}
                      >
                        {message.imageUrls.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setShowImageModal(url)}
                            className="overflow-hidden rounded-lg"
                          >
                            <img
                              src={url}
                              alt=""
                              className="h-40 w-full object-cover transition-transform hover:scale-105"
                            />
                          </button>
                        ))}
                      </div>
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
                  </div>
                </motion.div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <Avatar size="sm">
                  {isBot ? (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                      <Bot className="h-3 w-3 text-white" />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback>
                      {getInitials(recipient?.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="inline-block rounded-2xl bg-muted px-4 py-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Image Previews */}
      <AnimatePresence>
        {imagePreviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t px-4 py-2"
          >
            <div className="flex gap-2 overflow-x-auto">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <img
                    src={preview}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-center gap-2">
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
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1"
            disabled={isSending}
          />

          <Button
            type="submit"
            size="icon"
            disabled={
              isSending || (!inputValue.trim() && selectedImages.length === 0)
            }
          >
            {isSending ? <Spinner size="sm" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </form>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowImageModal(null)}
          >
            <button
              className="absolute right-4 top-4 text-white"
              onClick={() => setShowImageModal(null)}
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={showImageModal}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
