"use client";

import { useEffect, useCallback } from "react";
import { ImagePlus, X, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: (File | string)[];
  onChange: (value: (File | string)[]) => void;
}

export function ImageUpload({ value = [], onChange }: ImageUploadProps) {
  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      value.forEach((item) => {
        if (item instanceof File) {
          // Note: Browser handles cleanup, but we could manually revoke if referencing URLs directly
        }
      });
    };
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Limit to 10 images total
      const remainingSlots = 10 - value.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);

      if (filesToAdd.length > 0) {
        onChange([...value, ...filesToAdd]);
      }
    },
    [value, onChange]
  );

  const removeImage = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const getPreviewUrl = (item: File | string) => {
    if (typeof item === "string") {
      return item;
    }
    return URL.createObjectURL(item);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 10 - value.length,
    disabled: value.length >= 10,
  });

  return (
    <div className="space-y-4">
      {/* Main Drop Area (if no files or drag active) */}
      {(value.length === 0 || isDragActive) && (
        <div
          {...getRootProps()}
          className={cn(
            "border-3 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 bg-muted/20",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="h-20 w-20 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
            <UploadCloud
              className={cn(
                "h-10 w-10 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold">
              {isDragActive
                ? "วางรูปภาพที่นี่"
                : "คลิกเพื่อเลือกรูปภาพ หรือลากวาง"}
            </p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG, WEBP (สูงสุด 10 รูป)
            </p>
          </div>
        </div>
      )}

      {/* Grid View */}
      {value.length > 0 && !isDragActive && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
          {value.map((item, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={getPreviewUrl(item)}
                alt={`Property ${index + 1}`}
                className="h-full w-full rounded-2xl object-cover ring-1 ring-border bg-muted shadow-sm"
              />
              {index === 0 && (
                <Badge
                  className="absolute left-2 top-2 z-10 bg-black/50 hover:bg-black/60 backdrop-blur-md border-none text-white"
                  variant="secondary"
                >
                  รูปหลัก
                </Badge>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-sm transform scale-90 hover:scale-100 duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Minimal Drop Area for Adding Details */}
          {value.length < 10 && (
            <div
              {...getRootProps()}
              className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer text-muted-foreground hover:text-primary bg-muted/20"
            >
              <input {...getInputProps()} />
              <ImagePlus className="h-8 w-8 mb-2" />
              <span className="text-xs font-bold">เพิ่มรูปภาพ</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
