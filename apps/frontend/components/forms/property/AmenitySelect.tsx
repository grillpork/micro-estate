"use client";

import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { amenitiesService, type Amenity } from "@/services";

// Category display names in Thai
const CATEGORY_NAMES: Record<string, string> = {
  general: "ทั่วไป",
  security: "ความปลอดภัย",
  recreation: "สันทนาการ",
  convenience: "ความสะดวก",
  parking: "ที่จอดรถ",
  wellness: "สุขภาพ",
  outdoor: "พื้นที่ภายนอก",
  utilities: "สาธารณูปโภค",
};

// Define which categories are relevant for each property type
const PROPERTY_TYPE_CATEGORIES: Record<string, string[]> = {
  // Condo & Apartment - full amenities (vertical living)
  condo: [
    "general",
    "security",
    "recreation",
    "convenience",
    "parking",
    "wellness",
    "outdoor",
  ],
  apartment: [
    "general",
    "security",
    "recreation",
    "convenience",
    "parking",
    "wellness",
    "outdoor",
  ],

  // House & Townhouse - focus on security, parking, outdoor
  house: ["general", "security", "parking", "outdoor", "utilities"],
  townhouse: ["general", "security", "parking", "outdoor", "utilities"],

  // Land - only utilities relevant
  land: ["utilities"],

  // Commercial - business focused
  commercial: ["security", "convenience", "parking", "utilities"],
};

// Define specific amenities to exclude per property type (by name)
const EXCLUDED_AMENITIES: Record<string, string[]> = {
  land: [
    "Air Conditioning",
    "Furnished",
    "Partially Furnished",
    "Kitchen Appliances",
    "Washer",
    "Dryer",
    "Water Heater",
    "Balcony",
    "Storage Room",
    "Swimming Pool",
    "Kids Pool",
    "Playground",
    "Games Room",
    "Library",
    "Sky Lounge",
    "Rooftop Garden",
    "Cinema Room",
    "Elevator",
    "Lobby",
    "Mail Room",
    "Laundry Room",
    "Meeting Room",
    "Co-Working Space",
    "Fitness Center",
    "Yoga Room",
    "Spa",
    "Sauna",
    "Steam Room",
    "Massage Room",
    "Garden",
    "BBQ Area",
    "Tennis Court",
    "Basketball Court",
    "Jogging Track",
    "Mini Golf",
    "Lake View",
    "Sea View",
    "City View",
  ],
  commercial: [
    "Furnished",
    "Partially Furnished",
    "Kitchen Appliances",
    "Washer",
    "Dryer",
    "Swimming Pool",
    "Kids Pool",
    "Playground",
    "Games Room",
    "Library",
    "Sky Lounge",
    "Rooftop Garden",
    "Cinema Room",
    "Balcony",
    "Fitness Center",
    "Yoga Room",
    "Spa",
    "Sauna",
    "Steam Room",
    "Massage Room",
    "Tennis Court",
    "Basketball Court",
    "Jogging Track",
    "Mini Golf",
  ],
};

export function AmenitySelect() {
  const { watch, setValue } = useFormContext();

  const propertyType = watch("propertyType") as string;
  const selectedAmenities: string[] = watch("amenityIds") || [];

  // Fetch amenities from API
  const {
    data: groupedAmenities,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["amenities-grouped"],
    queryFn: amenitiesService.getGrouped,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const toggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      setValue(
        "amenityIds",
        selectedAmenities.filter((a) => a !== id)
      );
    } else {
      setValue("amenityIds", [...selectedAmenities, id]);
    }
  };

  // Filter amenities based on property type
  const getFilteredAmenities = () => {
    if (!groupedAmenities) return {};

    const allowedCategories =
      PROPERTY_TYPE_CATEGORIES[propertyType] || Object.keys(CATEGORY_NAMES);
    const excludedNames = EXCLUDED_AMENITIES[propertyType] || [];

    const filtered: Record<string, Amenity[]> = {};

    for (const [category, items] of Object.entries(groupedAmenities)) {
      // Skip categories not relevant to this property type
      if (!allowedCategories.includes(category)) continue;

      // Filter out excluded amenities
      const filteredItems = (items as Amenity[]).filter(
        (item) => !excludedNames.includes(item.name)
      );

      // Only add category if it has items
      if (filteredItems.length > 0) {
        filtered[category] = filteredItems;
      }
    }

    return filtered;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>สิ่งอำนวยความสะดวก</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">กำลังโหลด...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !groupedAmenities) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>สิ่งอำนวยความสะดวก</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredAmenities = getFilteredAmenities();
  const hasAmenities = Object.keys(filteredAmenities).length > 0;

  // For land type, show a different message
  if (propertyType === "land" && !hasAmenities) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>สิ่งอำนวยความสะดวก</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ที่ดินเปล่าไม่มีสิ่งอำนวยความสะดวกพิเศษ
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สิ่งอำนวยความสะดวก</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(filteredAmenities).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              {CATEGORY_NAMES[category] || category}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(items as Amenity[]).map((item) => {
                const isSelected = selectedAmenities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAmenity(item.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "border-input hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <span className="text-sm truncate">
                      {item.nameTh || item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
