"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui";
import { PropertyTypeCount } from "@/services";
import { Building2, Home, MapPin } from "lucide-react";

export function PropertyCategories({
  propertyTypes,
}: {
  propertyTypes: PropertyTypeCount[];
}) {
  const propertyTypesConfig: Record<
    string,
    { icon: React.ReactNode; label: string; image: string }
  > = {
    condo: {
      icon: <Building2 className="h-6 w-6" />,
      label: "คอนโด",
      image:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
    },
    house: {
      icon: <Home className="h-6 w-6" />,
      label: "บ้านเดี่ยว",
      image:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800",
    },
    townhouse: {
      icon: <Building2 className="h-6 w-6" />,
      label: "ทาวน์เฮาส์",
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    },
    land: {
      icon: <MapPin className="h-6 w-6" />,
      label: "ที่ดิน",
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    },
    commercial: {
      icon: <Building2 className="h-6 w-6" />,
      label: "อาคารพาณิชย์",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    },
    apartment: {
      icon: <Building2 className="h-6 w-6" />,
      label: "อพาร์ทเม้นท์",
      image:
        "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&q=80&w=800",
    },
  };

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-16 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            EXPLORE BY{" "}
            <span className="text-primary underline underline-offset-8">
              CATEGORIES
            </span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium">
            คัดสรรอสังหาฯ แยกตามไลฟ์สไตล์ เพื่อให้คุณเจอสิ่งที่ใช่เร็วขึ้น
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {propertyTypes.length === 0
            ? [...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-3xl" />
              ))
            : propertyTypes.map((type, index) => {
                const config =
                  propertyTypesConfig[type.type] || propertyTypesConfig.condo;
                return (
                  <motion.div
                    key={type.type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -10 }}
                  >
                    <Link
                      href={`/properties?type=${type.type}`}
                      className="group relative block h-72 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-border/40"
                    >
                      <Image
                        src={config.image}
                        alt={config.label}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-125 grayscale-30 group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 backdrop-blur-md flex items-center justify-center text-primary-foreground mb-3 border border-white/20 group-hover:bg-primary group-hover:scale-110 transition-all">
                          {config.icon}
                        </div>
                        <h3 className="text-white text-xl font-black mb-1 leading-tight">
                          {config.label}
                        </h3>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                          {type.count} Listings
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
