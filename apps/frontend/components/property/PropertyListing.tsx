"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Grid3X3, List, Zap, ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCachedProperties } from "@/actions/property-cache";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import type { SearchPropertiesParams } from "@/services";

import { PropertyFilters } from "@/components/property/PropertyFilters";
import { PropertyCardGrid } from "@/components/property/PropertyCardGrid";

export function PropertyListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Derive filters from URL search params
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
      province: searchParams.get("province") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: 12,
    };
  }, [searchParams]);

  // Use React Query
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.properties.list(filters),
    queryFn: () => getCachedProperties(filters),
    placeholderData: (previousData) => previousData,
  });

  const properties = result?.data || [];
  const meta = result?.meta || null;

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/properties?${params.toString()}`, { scroll: true });
  };

  const clearFilters = () => {
    router.push("/properties");
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== "page" && key !== "limit"
  ).length;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black">
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Badge className="bg-primary/10 text-primary mb-3 rounded-full font-black border-none uppercase tracking-widest text-[10px] px-3">
              Marketplace
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
              ALL <span className="text-primary italic">PROPERTIES</span>
              {isLoading && (
                <Zap className="h-6 w-6 text-primary animate-pulse" />
              )}
            </h1>
            <p className="mt-2 text-muted-foreground font-medium text-lg">
              พบ{" "}
              <span className="text-foreground font-black">
                {meta?.total || 0}
              </span>{" "}
              รายการอสังหาริมทรัพย์คุณภาพ
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex bg-white dark:bg-zinc-900 rounded-full p-1.5 border border-border/40 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 px-4 rounded-full transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider",
                  viewMode === "grid"
                    ? "bg-zinc-900 text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 px-4 rounded-full transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider",
                  viewMode === "list"
                    ? "bg-zinc-900 text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <PropertyFilters />

        {/* Error State */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 rounded-[32px] bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-8 text-center"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 mb-4">
              <X className="h-8 w-8" />
            </div>
            <p className="text-xl font-black mb-2 text-red-900 dark:text-red-400">
              ไม่สามารถโหลดข้อมูลได้ (
              {error instanceof Error ? error.message : "Unknown Error"})
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-full px-8"
              onClick={() => window.location.reload()}
            >
              ลองอีกครั้ง
            </Button>
          </motion.div>
        )}

        {/* Property Grid */}
        <PropertyCardGrid
          properties={properties}
          viewMode={viewMode}
          isLoading={isLoading}
          onResetFilters={clearFilters}
          hasFilters={activeFilterCount > 0}
        />

        {/* Pagination */}
        {meta && meta.totalPages > 1 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-20 flex items-center justify-center gap-3"
          >
            <Button
              variant="outline"
              className="rounded-full h-12 w-12 p-0 border-border/40 hover:bg-primary hover:text-white transition-all shadow-sm"
              disabled={meta.page <= 1}
              onClick={() => updatePage(meta.page - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center bg-white dark:bg-zinc-900 rounded-full px-6 h-12 border border-border/40 shadow-sm font-black text-sm">
              <span className="text-primary">{meta.page}</span>
              <span className="mx-2 text-muted-foreground/40">/</span>
              <span className="text-muted-foreground">{meta.totalPages}</span>
            </div>

            <Button
              variant="outline"
              className="rounded-full h-12 w-12 p-0 border-border/40 hover:bg-primary hover:text-white transition-all shadow-sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => updatePage(meta.page + 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
