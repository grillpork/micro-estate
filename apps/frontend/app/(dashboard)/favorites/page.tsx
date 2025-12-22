"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Building2,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Trash2,
} from "lucide-react";

import { Navbar, Footer } from "@/components/layout";
import { Button, Card, CardContent, Badge, Skeleton } from "@/components/ui";
import {
  favoritesService,
  type Favorite,
} from "@/stores/features/favorites/favorites.service";
import { formatPrice } from "@/lib/utils";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await favoritesService.getAll();
        setFavorites(data);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemove = async (propertyId: string) => {
    try {
      await favoritesService.remove(propertyId);
      setFavorites(favorites.filter((f) => f.propertyId !== propertyId));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            รายการที่บันทึกไว้
          </h1>
          <p className="mt-2 text-muted-foreground">
            อสังหาริมทรัพย์ที่คุณสนใจ
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
              ยังไม่มีรายการที่บันทึกไว้
            </h3>
            <p className="mt-2 max-w-sm text-muted-foreground">
              กดปุ่มหัวใจบนอสังหาริมทรัพย์ที่คุณสนใจเพื่อบันทึกไว้ดูภายหลัง
            </p>
            <Link href="/properties" className="mt-4">
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                ค้นหาอสังหาริมทรัพย์
              </Button>
            </Link>
          </div>
        )}

        {/* Favorites List */}
        {!isLoading && favorites.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite, index) => {
              const property = favorite.property;
              if (!property) return null;

              return (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group overflow-hidden transition-all hover:shadow-lg">
                    <Link href={`/properties/${property.id}`}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {property.thumbnailUrl ? (
                          <Image
                            src={property.thumbnailUrl}
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
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <Link href={`/properties/${property.id}`}>
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary">
                          {property.title}
                        </h3>
                      </Link>
                      {(property.address ||
                        property.district ||
                        property.province) && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {[property.district, property.province]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      <p className="mt-2 text-xl font-bold text-primary">
                        {formatPrice(Number(property.price))}
                        {property.listingType === "rent" && (
                          <span className="text-sm font-normal text-muted-foreground">
                            /เดือน
                          </span>
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
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/properties/${property.id}`}
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full">
                            ดูรายละเอียด
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemove(property.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
