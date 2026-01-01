"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, X, File as FileIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".webp"],
  },
  className,
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(newFiles);

      // Generate previews
      const newPreviews = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles));

      onFilesSelected(newFiles);
    },
    [files, maxFiles, onFilesSelected]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Revoke old URL
    URL.revokeObjectURL(previews[index]);

    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesSelected(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxFiles: maxFiles - files.length,
      maxSize,
      accept,
      disabled: disabled || files.length >= maxFiles,
    });

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          (disabled || files.length >= maxFiles) &&
            "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive
                ? "วางไฟล์ที่นี่"
                : "คลิกเพื่อเลือกรูปภาพ หรือลากวาง"}
            </p>
            <p className="text-xs text-muted-foreground">
              รองรับ JPG, PNG, WEBP (สูงสุด {maxSize / 1024 / 1024}MB)
            </p>
          </div>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <p className="font-medium">ไฟล์ไม่ถูกต้อง:</p>
          <ul className="list-disc list-inside mt-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name} - {errors[0].message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group border rounded-xl overflow-hidden bg-background"
            >
              <div className="aspect-square relative">
                {previews[index] ? (
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="p-2 text-xs truncate border-t bg-muted/30">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
