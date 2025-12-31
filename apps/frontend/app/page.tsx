"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Building2,
  Home,
  MapPin,
  TrendingUp,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Star,
  Loader2,
} from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
  Skeleton,
} from "@/components/ui";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  homeService,
  type HomeStats,
  type PropertyTypeCount,
  type FeaturedProperty,
} from "@/services";

const features = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI Matching",
    description: "ระบบ AI จับคู่ความต้องการของคุณกับอสังหาที่เหมาะสมที่สุด",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "ตัวแทนยืนยันตัวตน",
    description: "ตัวแทนทุกคนผ่านการยืนยันตัวตนเพื่อความปลอดภัย",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "ข้อมูลตลาดเรียลไทม์",
    description: "ติดตามราคาและแนวโน้มตลาดอสังหาริมทรัพย์",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "ชุมชนผู้ซื้อ-ผู้ขาย",
    description: "เชื่อมต่อโดยตรงกับเจ้าของหรือตัวแทนมืออาชีพ",
  },
];

const propertyTypeIcons: Record<string, React.ReactNode> = {
  condo: <Building2 className="h-6 w-6" />,
  house: <Home className="h-6 w-6" />,
  townhouse: <Building2 className="h-6 w-6" />,
  land: <MapPin className="h-6 w-6" />,
  commercial: <Building2 className="h-6 w-6" />,
  apartment: <Building2 className="h-6 w-6" />,
};

const propertyTypeLabels: Record<string, string> = {
  condo: "คอนโด",
  house: "บ้านเดี่ยว",
  townhouse: "ทาวน์เฮาส์",
  land: "ที่ดิน",
  commercial: "อาคารพาณิชย์",
  apartment: "อพาร์ทเม้นท์",
};

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeCount[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<
    FeaturedProperty[]
  >([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await homeService.getAll();
        setStats(data?.stats || null);
        setPropertyTypes(data?.propertyTypeCounts || []);
        setFeaturedProperties(data?.featuredProperties || []);
      } catch (err) {
        console.error("Failed to fetch home data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedType) params.set("type", selectedType);
    router.push(`/properties?${params.toString()}`);
  };

  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat("th-TH").format(price);
    return type === "rent" ? `฿${formatted}/เดือน` : `฿${formatted}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    return num.toString();
  };

  const getLocation = (property: FeaturedProperty) => {
    const parts = [];
    if (property.district) parts.push(property.district);
    if (property.province) parts.push(property.province);
    return parts.join(", ") || "ไม่ระบุ";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          <motion.div
            className="absolute top-20 right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              AI-Powered Real Estate Platform
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              ค้นหา<span className="text-primary">อสังหาริมทรัพย์</span>
              <br />
              ในฝันของคุณ
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              แพลตฟอร์มอัจฉริยะที่ใช้ AI
              ในการจับคู่ความต้องการกับอสังหาที่เหมาะสม ไม่ว่าจะซื้อ ขาย
              หรือเช่า
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-10 max-w-2xl"
            >
              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-lg sm:flex-row"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาตำแหน่ง, โครงการ, หรือคีย์เวิร์ด..."
                    className="border-0 pl-10 shadow-none focus-visible:ring-0"
                  />
                </div>
                <select
                  value={selectedType || ""}
                  onChange={(e) => setSelectedType(e.target.value || null)}
                  className="rounded-lg border bg-background px-4 py-2 text-sm"
                >
                  <option value="">ทุกประเภท</option>
                  <option value="condo">คอนโด</option>
                  <option value="house">บ้านเดี่ยว</option>
                  <option value="townhouse">ทาวน์เฮาส์</option>
                  <option value="land">ที่ดิน</option>
                </select>
                <Button type="submit" size="lg">
                  <Search className="mr-2 h-4 w-4" />
                  ค้นหา
                </Button>
              </form>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-12 flex max-w-lg justify-center gap-8 border-t pt-8"
            >
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-24" />
                  <Skeleton className="h-16 w-24" />
                  <Skeleton className="h-16 w-24" />
                </>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {formatNumber(stats?.totalProperties || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      รายการอสังหา
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {formatNumber(stats?.totalUsers || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">ผู้ใช้งาน</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {formatNumber(stats?.verifiedAgents || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ตัวแทนยืนยัน
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Property Types */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">ค้นหาตามประเภท</h2>
          <p className="mt-2 text-muted-foreground">
            เลือกประเภทอสังหาริมทรัพย์ที่คุณสนใจ
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 p-6">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-20 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : propertyTypes.length > 0 ? (
            propertyTypes.map((type, index) => (
              <motion.div
                key={type.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/properties?type=${type.type}`}>
                  <Card className="group cursor-pointer transition-all hover:border-primary hover:shadow-lg">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {propertyTypeIcons[type.type] || (
                          <Building2 className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {propertyTypeLabels[type.type] || type.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {type.count.toLocaleString()} รายการ
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              ยังไม่มีอสังหาริมทรัพย์
            </div>
          )}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">อสังหาแนะนำ</h2>
              <p className="mt-2 text-muted-foreground">
                รายการอสังหาริมทรัพย์ที่น่าสนใจ
              </p>
            </div>
            <Link href="/properties">
              <Button variant="outline">
                ดูทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-6 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/properties/${property.slug || property.id}`}>
                    <Card className="group overflow-hidden transition-all hover:shadow-lg">
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
                        <FavoriteButton
                          propertyId={property.id}
                          className="absolute right-3 top-3"
                          size="sm"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary">
                          {property.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {getLocation(property)}
                        </p>
                        <p className="mt-2 text-xl font-bold text-primary">
                          {formatPrice(property.price, property.listingType)}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                          {property.bedrooms && (
                            <span>{property.bedrooms} ห้องนอน</span>
                          )}
                          {property.bathrooms && (
                            <span>{property.bathrooms} ห้องน้ำ</span>
                          )}
                          {property.area && <span>{property.area} ตร.ม.</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                ยังไม่มีอสังหาริมทรัพย์แนะนำ
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">ทำไมต้อง Micro Estate</h2>
          <p className="mt-2 text-muted-foreground">
            แพลตฟอร์มที่ออกแบบมาเพื่อคุณโดยเฉพาะ
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            ไม่ว่าคุณจะกำลังมองหาบ้านในฝัน หรือต้องการลงประกาศขายอสังหา
            เราพร้อมช่วยเหลือคุณ
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/properties">
              <Button size="lg">
                <Search className="mr-2 h-4 w-4" />
                ค้นหาอสังหา
              </Button>
            </Link>
            <Link href="/become-agent">
              <Button size="lg" variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                เป็นตัวแทน
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
