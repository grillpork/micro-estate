"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";

interface ImageUploadProps {
  images: File[];
  setImages: (files: File[]) => void;
  imagePreviews: string[];
  setImagePreviews: (urls: string[]) => void;
}

export function ImageUpload({
  images,
  setImages,
  imagePreviews,
  setImagePreviews,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = [...images, ...files].slice(0, 10);
    setImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>รูปภาพอสังหา</CardTitle>
        <CardDescription>
          อัปโหลดรูปภาพ (สูงสุด 10 รูป, รูปแรกจะเป็นรูปหลัก)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={preview}
                alt={`Property ${index + 1}`}
                className="h-full w-full rounded-lg object-cover ring-1 ring-border"
              />
              {index === 0 && (
                <Badge
                  className="absolute left-2 top-2 z-10"
                  variant="secondary"
                >
                  รูปหลัก
                </Badge>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {images.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="text-center">
                <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground" />
                <span className="mt-2 block text-xs text-muted-foreground">
                  เพิ่มรูป
                </span>
              </div>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
