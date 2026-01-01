"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Building2, Bed, Bath, Ruler, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

interface PropertyCardGridProps {
  properties: Property[];
  viewMode: "grid" | "list";
  isLoading: boolean;
  onResetFilters?: () => void;
  hasFilters?: boolean;
}

export function PropertyCardGrid({
  properties,
  viewMode,
  isLoading,
  onResetFilters,
  hasFilters,
}: PropertyCardGridProps) {
  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat("th-TH").format(price);
    return type === "rent" ? `฿${formatted}/เดือน` : `฿${formatted}`;
  };

  const getLocation = (property: Property) => {
    const parts = [];
    if (property.district) parts.push(property.district);
    if (property.province) parts.push(property.province);
    return parts.join(", ") || "ไม่ระบุ";
  };

  const getPropertyImage = (property: Property) => {
    return property.thumbnailUrl || property.images?.[0]?.url || null;
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-8",
          viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}
      >
        {[...Array(6)].map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "rounded-[40px]",
              viewMode === "grid" ? "aspect-3/4" : "h-64"
            )}
          />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-32 text-center"
      >
        <div className="h-24 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-muted/50">
          <Building2 className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">
          Not Found
        </h3>
        <p className="text-muted-foreground font-medium text-lg mb-8">
          ไม่พบรายการอสังหาริมทรัพย์ที่ตรงกับตัวเลือกของคุณ
        </p>
        {hasFilters && onResetFilters && (
          <Button
            onClick={onResetFilters}
            size="lg"
            className="rounded-full shadow-xl px-12 font-black"
          >
            รีเซ็ตตัวกรองทั้งหมด
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-10",
        viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
      )}
    >
      {properties.map((property, index) => (
        <motion.div
          key={property.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (index % 6) * 0.05 }}
        >
          <Link
            href={`/properties/${property.slug || property.id}`}
            className={cn(
              "group block h-full bg-white dark:bg-zinc-900 overflow-hidden border border-border/40 hover:border-primary/40 transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]",
              viewMode === "grid" ? "rounded-[40px]" : "flex rounded-[32px]"
            )}
          >
            <div
              className={cn(
                "relative overflow-hidden bg-zinc-100 dark:bg-zinc-800",
                viewMode === "grid" ? "aspect-4/5" : "w-1/3 min-h-[300px]"
              )}
            >
              {getPropertyImage(property) ? (
                <Image
                  src={getPropertyImage(property)!}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Building2 className="h-16 w-16 text-muted-foreground/20" />
                </div>
              )}

              {/* Glass Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
                <Badge
                  className={cn(
                    "rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-wider backdrop-blur-xl border border-white/20 shadow-lg",
                    property.listingType === "sale"
                      ? "bg-primary/80"
                      : "bg-zinc-900/80"
                  )}
                >
                  {property.listingType === "sale" ? "For Sale" : "For Rent"}
                </Badge>
                {property.propertyType && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest bg-white/40 text-black dark:text-white border-white/40 backdrop-blur-md"
                  >
                    {property.propertyType}
                  </Badge>
                )}
              </div>

              <FavoriteButton
                propertyId={property.id}
                className="absolute right-6 top-6 h-12 w-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-white hover:bg-white hover:text-primary transition-all shadow-lg"
              />

              {/* Gradient & Price */}
              <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none">
                <p className="text-white text-3xl font-black leading-none drop-shadow-lg">
                  {formatPrice(Number(property.price), property.listingType)}
                </p>
              </div>
            </div>

            <div className="flex-1 p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-2xl line-clamp-2 leading-tight group-hover:text-primary transition-colors mb-4">
                  {property.title}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm mb-6">
                  <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                  {getLocation(property)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/40">
                {[
                  {
                    label: "Beds",
                    value: property.bedrooms,
                    icon: <Bed className="h-4 w-4" />,
                  },
                  {
                    label: "Baths",
                    value: property.bathrooms,
                    icon: <Bath className="h-4 w-4" />,
                  },
                  {
                    label: "Sq.m",
                    value: property.area,
                    icon: <Ruler className="h-4 w-4" />,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-muted-foreground/40">
                      {item.icon}
                    </span>
                    <span className="text-sm font-black">
                      {item.value || "-"}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
