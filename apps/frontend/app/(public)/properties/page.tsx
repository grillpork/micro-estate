"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Filter,
  MapPin,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Bed,
  Bath,
  Ruler,
  Heart,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import { Navbar, Footer } from "@/components/layout";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
  Spinner,
  Skeleton,
} from "@/components/ui";
import { propertiesService, type SearchPropertiesParams } from "@/services";
import { cn } from "@/lib";
import type { Property } from "@/types";

interface PropertyFilters {
  q?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  province?: string;
  page?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filters from URL
  const [filters, setFilters] = useState<PropertyFilters>({
    q: searchParams.get("q") || undefined,
    propertyType:
      searchParams.get("type") || searchParams.get("propertyType") || undefined,
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
  });

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: SearchPropertiesParams = {
          page: filters.page || 1,
          limit: 12,
        };

        if (filters.q) params.q = filters.q;
        if (filters.propertyType) params.propertyType = filters.propertyType;
        if (filters.listingType) params.listingType = filters.listingType;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.bedrooms) params.bedrooms = filters.bedrooms;
        if (filters.province) params.province = filters.province;

        const result = await propertiesService.getAll(params);
        setProperties(result.data || []);
        setMeta(result.meta || null);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  const updateFilter = (key: keyof PropertyFilters, value: unknown) => {
    const newFilters: PropertyFilters = {
      ...filters,
      [key]: value || undefined,
      page: key !== "page" ? 1 : (value as number),
    };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== "") {
        // Map propertyType to type for URL
        const urlKey = k === "propertyType" ? "type" : k;
        params.set(urlKey, String(v));
      }
    });
    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ page: 1 });
    router.push("/properties");
  };

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

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== "page"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ค้นหาอสังหาริมทรัพย์</h1>
          {isLoading ? (
            <Skeleton className="mt-2 h-5 w-32" />
          ) : (
            <p className="mt-2 text-muted-foreground">
              พบ {meta?.total || 0} รายการ
            </p>
          )}
        </div>

        {/* Search & Filters Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q || ""}
              onChange={(e) => updateFilter("q", e.target.value)}
              placeholder="ค้นหาตำแหน่ง, โครงการ..."
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              ตัวกรอง
              {activeFilterCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            <div className="flex rounded-lg border">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid" ? "bg-accent" : "hover:bg-accent"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list" ? "bg-accent" : "hover:bg-accent"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-lg border bg-card p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Property Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ประเภท</label>
                <select
                  value={filters.propertyType || ""}
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
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

              {/* Listing Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ประกาศ</label>
                <select
                  value={filters.listingType || ""}
                  onChange={(e) => updateFilter("listingType", e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="sale">ขาย</option>
                  <option value="rent">เช่า</option>
                </select>
              </div>

              {/* Min Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ราคาต่ำสุด</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    updateFilter(
                      "minPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ราคาสูงสุด</label>
                <Input
                  type="number"
                  placeholder="ไม่จำกัด"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    updateFilter(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ห้องนอน</label>
                <select
                  value={filters.bedrooms || ""}
                  onChange={(e) =>
                    updateFilter(
                      "bedrooms",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  ล้างตัวกรอง
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              ลองใหม่
            </Button>
          </div>
        )}

        {/* Properties Grid/List */}
        {isLoading ? (
          <div
            className={cn(
              "grid gap-6",
              viewMode === "grid"
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            )}
          >
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">
              ไม่พบรายการอสังหาริมทรัพย์
            </p>
            <p className="mt-2 text-muted-foreground">
              ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น
            </p>
            {activeFilterCount > 0 && (
              <Button className="mt-4" onClick={clearFilters}>
                ล้างตัวกรอง
              </Button>
            )}
          </div>
        ) : (
          <>
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/properties/${property.id}`}>
                    <Card
                      className={cn(
                        "group overflow-hidden transition-all hover:shadow-lg",
                        viewMode === "list" && "flex"
                      )}
                    >
                      <div
                        className={cn(
                          "relative overflow-hidden bg-muted",
                          viewMode === "grid"
                            ? "aspect-[4/3]"
                            : "w-48 flex-shrink-0"
                        )}
                      >
                        {getPropertyImage(property) ? (
                          <Image
                            src={getPropertyImage(property)!}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Building2 className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <Badge
                          className="absolute left-3 top-3"
                          variant={
                            property.listingType === "sale"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {property.listingType === "sale" ? "ขาย" : "เช่า"}
                        </Badge>
                        <FavoriteButton
                          propertyId={property.id}
                          className="absolute right-3 top-3"
                          size="sm"
                        />
                      </div>
                      <CardContent className="flex-1 p-4">
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary">
                          {property.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {getLocation(property)}
                        </p>
                        <p className="mt-2 text-xl font-bold text-primary">
                          {formatPrice(
                            Number(property.price),
                            property.listingType
                          )}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                          {property.bedrooms && (
                            <span className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              {property.bedrooms}
                            </span>
                          )}
                          {property.bathrooms && (
                            <span className="flex items-center gap-1">
                              <Bath className="h-4 w-4" />
                              {property.bathrooms}
                            </span>
                          )}
                          {property.area && (
                            <span className="flex items-center gap-1">
                              <Ruler className="h-4 w-4" />
                              {property.area} ตร.ม.
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => updateFilter("page", meta.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  ก่อนหน้า
                </Button>
                <span className="px-4 text-sm text-muted-foreground">
                  หน้า {meta.page} จาก {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => updateFilter("page", meta.page + 1)}
                >
                  ถัดไป
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
