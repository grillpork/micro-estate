"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui";
import { favoritesService } from "@/services";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  propertyId: string;
  initialFavorited?: boolean;
  variant?: "icon" | "button";
  size?: "sm" | "md" | "lg";
  className?: string;
  onToggle?: (favorited: boolean) => void;
}

export function FavoriteButton({
  propertyId,
  initialFavorited = false,
  variant = "icon",
  size = "md",
  className,
  onToggle,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Check initial favorite status
  useEffect(() => {
    if (!isChecked && !initialFavorited) {
      favoritesService.check(propertyId).then((favorited) => {
        setIsFavorited(favorited);
        setIsChecked(true);
      });
    } else {
      setIsChecked(true);
    }
  }, [propertyId, isChecked, initialFavorited]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const result = await favoritesService.toggle(propertyId);
      setIsFavorited(result.favorited);
      onToggle?.(result.favorited);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize =
    size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6";

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "flex items-center justify-center rounded-full bg-white/90 p-2 shadow-sm transition-all hover:bg-white hover:scale-110 disabled:opacity-50",
          className
        )}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            iconSize,
            "transition-colors",
            isFavorited
              ? "fill-red-500 text-red-500"
              : "text-gray-600 hover:text-red-500"
          )}
        />
      </button>
    );
  }

  return (
    <Button
      variant={isFavorited ? "destructive" : "outline"}
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
      onClick={handleToggle}
      disabled={isLoading}
      className={className}
    >
      <Heart
        className={cn(
          size === "sm" ? "mr-1 h-3 w-3" : "mr-2 h-4 w-4",
          isFavorited && "fill-current"
        )}
      />
      {isFavorited ? "บันทึกแล้ว" : "บันทึก"}
    </Button>
  );
}
