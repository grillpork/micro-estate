"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyGalleryProps {
  images: string[];
  title: string;
  status?: string;
}

export const PropertyGallery = ({
  images = [],
  title,
  status = "For Sale",
}: PropertyGalleryProps) => {
  // 1. Setup Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 2. Fallback if no images
  const displayImages =
    images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop",
        ];

  // 3. Update Selected Index
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // 4. Navigation Handlers
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 group">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {displayImages.map((src, index) => (
              <div key={index} className="relative flex-[0_0_100%] h-full">
                <Image
                  src={src}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold shadow-sm z-10">
          {status}
        </div>

        {/* Navigation Buttons (Show on Hover) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity aria-disabled:opacity-50"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity aria-disabled:opacity-50"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((src, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "relative flex-[0_0_20%] aspect-square rounded-lg overflow-hidden transition-all duration-300 ring-2 ring-offset-2",
                selectedIndex === index
                  ? "ring-blue-600 opacity-100 scale-105"
                  : "ring-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={src}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
