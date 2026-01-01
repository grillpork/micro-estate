"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Building2,
  Bed,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SearchPropertiesParams } from "@/services";

interface PropertyFiltersProps {
  onFiltersChange?: (filters: SearchPropertiesParams) => void;
}

export function PropertyFilters({ onFiltersChange }: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Derive filters from URL
  const filters: SearchPropertiesParams = useMemo(() => {
    return {
      q: searchParams.get("q") || undefined,
      propertyType:
        searchParams.get("type") ||
        searchParams.get("propertyType") ||
        undefined,
      listingType: searchParams.get("listingType") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      bedrooms: searchParams.get("bedrooms")
        ? Number(searchParams.get("bedrooms"))
        : undefined,
    };
  }, [searchParams]);

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== "page" && key !== "limit"
  ).length;

  const updateFilter = (key: keyof SearchPropertiesParams, value: unknown) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
      page: 1, // Reset page on filter change
    };

    // Update URL
    const params = new URLSearchParams();
    // Copy existing params to preserve others if needed (e.g. viewMode if it was in URL)
    searchParams.forEach((val, k) => params.set(k, val));

    // Update with new values
    if (value === undefined || value === "") {
      params.delete(key === "propertyType" ? "type" : key);
    } else {
      const urlKey = key === "propertyType" ? "type" : key;
      params.set(urlKey, String(value));
    }

    // Reset page param
    params.set("page", "1");

    router.push(`/properties?${params.toString()}`, { scroll: false });

    if (onFiltersChange) onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    router.push("/properties");
  };

  return (
    <div className="mb-10 sticky top-24 z-30">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-3 p-3 rounded-3xl md:rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border/40 shadow-xl"
      >
        <div className="flex-2 relative flex items-center">
          <div className="absolute left-4 p-2 rounded-full bg-primary/5">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <Input
            value={filters.q || ""}
            onChange={(e) => updateFilter("q", e.target.value)}
            placeholder="ค้นหาตามตำแหน่ง, โครงการ, หรือคีย์เวิร์ด..."
            className="h-12 border-none pl-14 shadow-none focus-visible:ring-0 font-bold bg-transparent"
          />
        </div>

        <div className="h-12 w-px bg-border/40 hidden md:block" />

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-12 px-6 rounded-full font-black text-xs uppercase tracking-widest transition-all",
              showFilters
                ? "bg-primary text-white"
                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200"
            )}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 flex items-center justify-center h-5 w-5 bg-white text-primary rounded-full font-black text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Expanded Filters Glass Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 12, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-full left-0 right-0 rounded-[40px] bg-white/90 dark:bg-zinc-900/95 backdrop-blur-2xl border border-border/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] p-8 overflow-hidden"
          >
            {/* Decorative background for filters */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <LayoutGrid className="h-3 w-3" />
                  ประเภทอสังหาฯ
                </label>
                <select
                  value={filters.propertyType || ""}
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                  className="w-full h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none px-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all appearance-none"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="condo">คอนโด</option>
                  <option value="house">บ้านเดี่ยว</option>
                  <option value="townhouse">ทาวน์เฮาส์</option>
                  <option value="apartment">อพาร์ทเมนต์</option>
                  <option value="land">ที่ดิน</option>
                  <option value="commercial">อาคารพาณิชย์</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  ประเภทประกาศ
                </label>
                <select
                  value={filters.listingType || ""}
                  onChange={(e) => updateFilter("listingType", e.target.value)}
                  className="w-full h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none px-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all appearance-none"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="sale">ขาย</option>
                  <option value="rent">เช่า</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  ฿ ราคาต่ำสุด
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ""}
                  className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none px-4 text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary shadow-none"
                  onChange={(e) =>
                    updateFilter(
                      "minPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  ฿ ราคาสูงสุด
                </label>
                <Input
                  type="number"
                  placeholder="ไม่จำกัด"
                  value={filters.maxPrice || ""}
                  className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none px-4 text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary shadow-none"
                  onChange={(e) =>
                    updateFilter(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Bed className="h-3 w-3" />
                  จำนวนห้องนอน
                </label>
                <select
                  value={filters.bedrooms || ""}
                  onChange={(e) =>
                    updateFilter(
                      "bedrooms",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none px-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all appearance-none"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="1">1+ ห้องนอน</option>
                  <option value="2">2+ ห้องนอน</option>
                  <option value="3">3+ ห้องนอน</option>
                  <option value="4">4+ ห้องนอน</option>
                </select>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border/40 flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">
                แสดงผลแบบ Real-time ตามตัวเลือกของคุณ
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="rounded-full h-10 px-6 font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
                >
                  <X className="mr-2 h-3.5 w-3.5" />
                  Clear all filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
