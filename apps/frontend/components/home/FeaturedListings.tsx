"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Skeleton, Badge, Button } from "@/components/ui";
import { FeaturedProperty } from "@/services";
import { Building2, Home, MapPin, ArrowRight, LayoutGrid } from "lucide-react";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { cn } from "@/lib/utils";

export function FeaturedListings({
  properties,
}: {
  properties: FeaturedProperty[];
}) {
  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat("th-TH").format(price);
    return type === "rent" ? `฿${formatted}/เดือน` : `฿${formatted}`;
  };

  const getLocation = (property: FeaturedProperty) => {
    const parts = [];
    if (property.district) parts.push(property.district);
    if (property.province) parts.push(property.province);
    return parts.join(", ") || "ไม่ระบุ";
  };

  return (
    <section className="bg-zinc-50 dark:bg-zinc-950/20 py-24 rounded-[60px] mx-4 border border-border/30 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <Badge
              variant="outline"
              className="mb-4 border-primary/30 text-primary font-black uppercase"
            >
              Editor's Choice
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              FEATURED <span className="text-primary italic">LISTINGS</span>
            </h2>
            <p className="text-muted-foreground font-medium text-lg mt-2">
              อสังหาริมทรัพย์คุณภาพที่เราคัดมาเพื่อคุณโดยเฉพาะ
            </p>
          </div>
          <Link href="/properties">
            <Button
              size="lg"
              className="rounded-2xl h-14 px-8 font-black bg-zinc-900 border-zinc-800 hover:bg-black group transition-all"
            >
              ดูทั้งหมด
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {properties.length === 0
            ? [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-3/4 rounded-[40px]" />
              ))
            : properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <Link
                    href={`/properties/${property.slug || property.id}`}
                    className="block h-full bg-white dark:bg-zinc-900 rounded-[40px] overflow-hidden border border-border/40 hover:border-primary/40 transition-all hover:shadow-[0_20px_60px_-15px_rgba(var(--primary-rgb),0.15)]"
                  >
                    <div className="relative aspect-4/5 overflow-hidden">
                      {property.thumbnailUrl ? (
                        <Image
                          src={property.thumbnailUrl}
                          alt={property.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Building2 className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Glass Overlay Badges */}
                      <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none">
                        <Badge
                          className={cn(
                            "rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-wider backdrop-blur-xl border border-white/20",
                            property.listingType === "sale"
                              ? "bg-primary/80"
                              : "bg-zinc-900/80"
                          )}
                        >
                          {property.listingType === "sale"
                            ? "For Sale"
                            : "For Rent"}
                        </Badge>
                        <FavoriteButton
                          propertyId={property.id}
                          className="pointer-events-auto h-12 w-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-white hover:bg-white hover:text-primary transition-all shadow-lg"
                        />
                      </div>

                      {/* Gradient Fade */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Price in Image */}
                      <div className="absolute bottom-6 left-8 pointer-events-none">
                        <p className="text-white/80 text-xs font-black uppercase tracking-widest mb-1 italic">
                          Investment Starting at
                        </p>
                        <p className="text-white text-3xl font-black leading-none drop-shadow-md">
                          {formatPrice(property.price, property.listingType)}
                        </p>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-black text-2xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground mb-6 font-bold text-sm">
                        <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        {getLocation(property)}
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
                        {[
                          {
                            label: "Beds",
                            value: property.bedrooms,
                            icon: <Home className="h-4 w-4" />,
                          },
                          {
                            label: "Baths",
                            value: property.bathrooms,
                            icon: <Building2 className="h-4 w-4" />,
                          },
                          {
                            label: "Sq.m",
                            value: property.area,
                            icon: <LayoutGrid className="h-4 w-4" />,
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

                  {/* Hot Tag Animation */}
                  {index === 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-4 -right-4 bg-orange-500 text-white font-black text-[10px] px-3 py-1 rounded-full shadow-lg rotate-12 z-10"
                    >
                      HOT DEAL
                    </motion.div>
                  )}
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
