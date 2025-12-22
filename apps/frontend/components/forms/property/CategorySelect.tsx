"use client";

import { useFormContext } from "react-hook-form";
import { Building, Building2, Home, Store, Trees } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { PropertyType } from "@/types";

const propertyTypes: {
  value: PropertyType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "condo", label: "คอนโด", icon: <Building className="h-5 w-5" /> },
  { value: "house", label: "บ้านเดี่ยว", icon: <Home className="h-5 w-5" /> },
  {
    value: "townhouse",
    label: "ทาวน์เฮาส์",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    value: "apartment",
    label: "อพาร์ทเมนต์",
    icon: <Building className="h-5 w-5" />,
  },
  { value: "land", label: "ที่ดิน", icon: <Trees className="h-5 w-5" /> },
  {
    value: "commercial",
    label: "อาคารพาณิชย์",
    icon: <Store className="h-5 w-5" />,
  },
];

export function CategorySelect() {
  const { watch, setValue } = useFormContext();
  const selectedType = watch("propertyType");

  return (
    <Card>
      <CardHeader>
        <CardTitle>ประเภทอสังหา *</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {propertyTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setValue("propertyType", type.value)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                selectedType === type.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "hover:border-primary/50"
              }`}
            >
              {type.icon}
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
