"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, Video as VideoIcon, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shortsService, mediaService } from "@/services"; // Use barrel export
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function UploadShortButton() {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Create Short Mutation
  const createShortMutation = useMutation({
    mutationFn: (videoUrl: string) =>
      shortsService.createShort(videoUrl, description),
    onSuccess: () => {
      resetForm();
      setOpen(false);
      toast.success("อัปโหลดวิดีโอสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["shorts", "feed"] });
    },
    onError: () => {
      toast.error("สร้างโพสต์ไม่สำเร็จ");
    },
  });

  // Upload File Mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaService.upload(file, "short"),
    onError: () => {
      toast.error("อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่");
    },
  });

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 50MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      // 1. Upload Video
      const uploadResult = await uploadMutation.mutateAsync(selectedFile);

      // 2. Create Short Entry
      await createShortMutation.mutateAsync(uploadResult.url);
    } catch (error) {
      console.error(error);
      // Errors handled in mutation callbacks
    }
  };

  const isLoading = uploadMutation.isPending || createShortMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        setOpen(val);
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full" variant="secondary">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">อัปโหลดคลิป</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>อัปโหลดคลิปสั้น (Short)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">วิดีโอ</label>

            {!previewUrl ? (
              <div
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <VideoIcon className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">คลิกเพื่อเลือกวิดีโอ</p>
                <p className="text-xs text-muted-foreground mt-1">
                  MP4, WebM (Max 50MB)
                </p>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden max-h-[300px] mx-auto w-full max-w-[180px]">
                <video
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  controls
                />
                <button
                  type="button"
                  onClick={resetForm}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">คำอธิบาย</label>
            <Textarea
              placeholder="เขียนคำบรรยาย..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedFile || isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {uploadMutation.isPending
              ? "กำลังอัปโหลด..."
              : createShortMutation.isPending
                ? "กำลังโพสต์..."
                : "โพสต์คลิป"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
