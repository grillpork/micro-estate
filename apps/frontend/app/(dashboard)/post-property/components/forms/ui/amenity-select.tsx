"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Temporary static list of amenities (mocking backend data)
const AMENITIES = [
  { id: "pool", label: "สระว่ายน้ำ", category: "Facilities" },
  { id: "gym", label: "ฟิตเนส", category: "Facilities" },
  { id: "parking", label: "ที่จอดรถ", category: "Facilities" },
  { id: "security", label: "รปภ. 24 ชม.", category: "Security" },
  { id: "cctv", label: "กล้องวงจรปิด", category: "Security" },
  { id: "garden", label: "สวน / BBQ", category: "Facilities" },
  { id: "playground", label: "สนามเด็กเล่น", category: "Facilities" },
  { id: "wifi", label: "Wi-Fi", category: "Convenience" },
  { id: "elevator", label: "ลิฟต์", category: "Convenience" },
  { id: "sauna", label: "ซาวน่า", category: "Facilities" },
  { id: "laundry", label: "ห้องซักรีด", category: "Convenience" },
  { id: "shuttle", label: "รถรับส่ง", category: "Convenience" },
];

interface AmenitySelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

export function AmenitySelect({ value = [], onChange }: AmenitySelectProps) {
  const selectedAmenities = value;

  const toggleAmenity = (id: string) => {
    const current = selectedAmenities;
    let newValue: string[];
    if (current.includes(id)) {
      newValue = current.filter((item: string) => item !== id);
    } else {
      newValue = [...current, id];
    }
    onChange?.(newValue);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {AMENITIES.map((amenity) => {
        const isSelected = selectedAmenities.includes(amenity.id);
        return (
          <div
            key={amenity.id}
            onClick={() => toggleAmenity(amenity.id)}
            className={cn(
              "cursor-pointer rounded-xl border p-4 flex items-center justify-between transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/5 text-primary shadow-sm"
                : "border-input hover:border-primary/50 hover:bg-muted/50 text-muted-foreground"
            )}
          >
            <span className="text-sm font-medium">{amenity.label}</span>
            {isSelected && <Check className="h-4 w-4" />}
          </div>
        );
      })}
    </div>
  );
}
