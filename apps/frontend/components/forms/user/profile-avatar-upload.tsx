"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { api } from "@/services";

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ProfileAvatarUploadProps {
  currentImage?: string | null;
  userName?: string;
}

export function ProfileAvatarUpload({
  currentImage,
  userName,
}: ProfileAvatarUploadProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/users/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("อัปโหลดรูปโปรไฟล์สำเร็จ");
    } catch {
      toast.error("ไม่สามารถอัปโหลดรูปได้");
      setPreviewImage(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group"
    >
      <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-3xl overflow-hidden border-4 border-background shadow-2xl transition-transform hover:scale-[1.02]">
        <Avatar className="h-full w-full rounded-none">
          <AvatarImage
            src={previewImage || currentImage || ""}
            alt={userName || ""}
            className="object-cover"
          />
          <AvatarFallback className="text-4xl rounded-none bg-muted">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        <AnimatePresence>
          {isUploadingImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10"
            >
              <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
          className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xl transition-all hover:scale-110 hover:shadow-primary/30 active:scale-95 group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100"
        >
          <Camera className="h-5 w-5" />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </motion.div>
  );
}
