"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { shortsService } from "@/services/shorts/shorts.service";
import { ShortVideoItem } from "./ShortVideoItem";
import { Loader2 } from "lucide-react";
import { useIntersectionObserver } from "usehooks-ts";

export function ShortsFeed() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["shorts", "feed"],
    queryFn: () => shortsService.getFeed(20), // Get 20 at a time
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll snapping detection to auto-play correct video
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, clientHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);

    if (
      index !== activeIndex &&
      index >= 0 &&
      videos &&
      index < videos.length
    ) {
      setActiveIndex(index);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 text-white animate-spin" />
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-black text-white">
        <p>ยังไม่มีวิดีโอในขณะนี้</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-64px)] lg:h-[calc(100vh)] w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
      onScroll={handleScroll}
    >
      {videos.map((video, index) => (
        <ShortVideoItem
          key={video.id}
          video={video}
          isActive={index === activeIndex}
        />
      ))}
    </div>
  );
}
