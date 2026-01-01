"use client";

import { useState, useEffect } from "react";
import { Share2, Heart, MapPin } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { propertiesService } from "@/services";
import { toast } from "sonner";

interface PropertyHeaderProps {
  id: string;
  title: string;
  propertyType: string;
  propertyTypeLabel: string;
  location: string;
}

export function PropertyHeader({
  id,
  title,
  propertyType,
  propertyTypeLabel,
  location,
}: PropertyHeaderProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Increment views on mount
  useEffect(() => {
    if (id) {
      propertiesService.incrementViews(id).catch(() => {
        // Silently fail
      });
    }
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out ${title} on Micro Estate`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or failed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("คัดลอกลิงก์แล้ว!");
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <Badge variant="outline" className="mb-2">
          {propertyTypeLabel || propertyType}
        </Badge>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-2">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </Button>
        <Button variant="outline" size="icon" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
