"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge, Card } from "@/components/ui";

interface PropertyImage {
  url: string;
  isPrimary?: boolean;
}

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
  listingType: string;
  listingTypeLabel: string;
}

export function PropertyGallery({
  images,
  title,
  listingType,
  listingTypeLabel,
}: PropertyGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // If no images, add placeholder
  const displayImages =
    images.length > 0
      ? images
      : [
          {
            url: "https://picsum.photos/800/600?random=1",
            isPrimary: true,
          },
        ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length
    );
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-muted">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={
                  displayImages[currentImageIndex]?.url || "/placeholder.jpg"
                }
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                type="button"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                type="button"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
            {currentImageIndex + 1} / {displayImages.length}
          </div>

          {/* Listing Type Badge */}
          <Badge
            className="absolute top-4 left-4"
            variant={listingType === "sale" ? "default" : "secondary"}
          >
            {listingTypeLabel}
          </Badge>
        </div>

        {/* Thumbnails */}
        {displayImages.length > 1 && (
          <div className="p-4 flex gap-2 overflow-x-auto">
            {displayImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 ring-2 transition-all ${
                  index === currentImageIndex
                    ? "ring-primary"
                    : "ring-transparent hover:ring-primary/50"
                }`}
                type="button"
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
              onClick={() => setIsLightboxOpen(false)}
              type="button"
            >
              <X className="h-8 w-8" />
            </button>

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
                  type="button"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
                  type="button"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <div className="relative w-full max-w-5xl h-[80vh] mx-4">
              <Image
                src={
                  displayImages[currentImageIndex]?.url || "/placeholder.jpg"
                }
                alt={title}
                fill
                sizes="100vw"
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
