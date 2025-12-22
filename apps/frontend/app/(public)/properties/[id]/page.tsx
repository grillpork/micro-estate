"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Building,
  Car,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  Layers,
  ArrowLeft,
  Check,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

import { Navbar, Footer } from "@/components/layout";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Skeleton,
  Input,
} from "@/components/ui";
import { PaymentModal } from "@/components/payment";
import { usePayment } from "@/hooks/usePayment";
import { propertiesService } from "@/services";
import { formatPrice } from "@/lib/utils";

// Property type labels
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  condo: "คอนโดมิเนียม",
  house: "บ้านเดี่ยว",
  townhouse: "ทาวน์เฮาส์",
  land: "ที่ดิน",
  apartment: "อพาร์ทเมนต์",
  commercial: "อาคารพาณิชย์",
};

const LISTING_TYPE_LABELS: Record<string, string> = {
  sale: "ขาย",
  rent: "เช่า",
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertiesService.getById(id),
    enabled: !!id,
  });

  const [bookingDate, setBookingDate] = useState("");
  const [isBookingMode, setIsBookingMode] = useState(false);

  const { modalProps, openPayment } = usePayment({
    onSuccess: () => {
      toast.success("จองอสังหาริมทรัพย์สำเร็จ!");
      setIsBookingMode(false);
    },
    onError: (err) => {
      toast.error(err);
    },
  });

  const handleBooking = () => {
    if (!bookingDate) {
      toast.error("กรุณาเลือกวันที่ต้องการเข้าชมหรือเข้าอยู่");
      return;
    }

    openPayment({
      type: "booking_deposit",
      amount: 200,
      propertyId: id,
      description: `มัดจำจอง ${property?.title} สำหรับวันที่ ${new Date(bookingDate).toLocaleDateString("th-TH")}`,
    });
  };

  // Increment views when page is viewed
  useEffect(() => {
    if (id && property) {
      propertiesService.incrementViews(id).catch(() => {
        // Silently fail - views tracking is not critical
      });
    }
  }, [id, property?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <PropertySkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">ไม่พบอสังหาริมทรัพย์</h1>
            <p className="text-muted-foreground mb-6">
              ประกาศนี้อาจถูกลบหรือไม่มีอยู่ในระบบ
            </p>
            <Link href="/properties">
              <Button>ดูประกาศทั้งหมด</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Parse images - handle both string array and object array
  const images: { url: string; isPrimary?: boolean }[] = [];
  if (property.thumbnailUrl) {
    images.push({ url: property.thumbnailUrl, isPrimary: true });
  }
  if (property.images && Array.isArray(property.images)) {
    property.images.forEach((img: any) => {
      const url = typeof img === "string" ? img : img.url;
      if (url && !images.some((i) => i.url === url)) {
        images.push({ url, isPrimary: img.isPrimary });
      }
    });
  }

  // If no images, add placeholder
  if (images.length === 0) {
    images.push({
      url: "https://picsum.photos/800/600?random=1",
      isPrimary: true,
    });
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: property.title,
        text: property.description || "",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("คัดลอกลิงก์แล้ว!");
    }
  };

  // Parse amenities
  let amenitiesDisplay: { name: string; id: string }[] = [];
  if (property.amenities && Array.isArray(property.amenities)) {
    amenitiesDisplay = property.amenities.map((item: any) => ({
      id: item.amenityId,
      name: item.amenity?.nameTh || item.amenity?.name || "ไม่ระบุชื่อ",
    }));
  } else if ((property as any).amenities) {
    // Fallback for legacy JSON format
    try {
      const rawAmenities = (property as any).amenities;
      const parsed =
        typeof rawAmenities === "string"
          ? JSON.parse(rawAmenities)
          : rawAmenities;

      if (Array.isArray(parsed)) {
        amenitiesDisplay = parsed.map((a: any) => ({
          id: typeof a === "string" ? a : a.id,
          name: typeof a === "string" ? a : a.name || a.nameTh,
        }));
      }
    } catch {
      amenitiesDisplay = [];
    }
  }

  // Parse features
  let features: string[] = [];
  if ((property as any).features) {
    try {
      const rawFeatures = (property as any).features;
      features =
        typeof rawFeatures === "string" ? JSON.parse(rawFeatures) : rawFeatures;
    } catch {
      features = [];
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับ
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[currentImageIndex]?.url || "/placeholder.jpg"}
                      alt={property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 66vw"
                      className="object-cover cursor-pointer"
                      onClick={() => setIsLightboxOpen(true)}
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>

                {/* Listing Type Badge */}
                <Badge
                  className="absolute top-4 left-4"
                  variant={
                    property.listingType === "sale" ? "default" : "secondary"
                  }
                >
                  {LISTING_TYPE_LABELS[property.listingType] ||
                    property.listingType}
                </Badge>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 ring-2 transition-all ${
                        index === currentImageIndex
                          ? "ring-primary"
                          : "ring-transparent hover:ring-primary/50"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Property Info */}
            <Card>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {PROPERTY_TYPE_LABELS[property.propertyType] ||
                        property.propertyType}
                    </Badge>
                    <h1 className="text-2xl font-bold">{property.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {[property.district, property.province]
                          .filter(Boolean)
                          .join(", ") || "ไม่ระบุตำแหน่ง"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isFavorite ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(Number(property.price))}
                    {property.listingType === "rent" && (
                      <span className="text-lg font-normal text-muted-foreground">
                        /เดือน
                      </span>
                    )}
                  </p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                  {property.bedrooms !== null &&
                    property.bedrooms !== undefined && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            ห้องนอน
                          </p>
                          <p className="font-semibold">{property.bedrooms}</p>
                        </div>
                      </div>
                    )}
                  {property.bathrooms !== null &&
                    property.bathrooms !== undefined && (
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            ห้องน้ำ
                          </p>
                          <p className="font-semibold">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                  {property.area && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          พื้นที่ใช้สอย
                        </p>
                        <p className="font-semibold">{property.area} ตร.ม.</p>
                      </div>
                    </div>
                  )}
                  {(property.floor || (property as any).floors) && (
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">ชั้น</p>
                        <p className="font-semibold">
                          {property.floor || (property as any).floors}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {property.description && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">รายละเอียด</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Additional Details */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">
                    ข้อมูลเพิ่มเติม
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {property.landArea && (
                      <div className="flex items-center gap-3">
                        <Home className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            ที่ดิน
                          </p>
                          <p className="font-medium">
                            {property.landArea} ตร.วา
                          </p>
                        </div>
                      </div>
                    )}
                    {property.yearBuilt && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            ปีที่สร้าง
                          </p>
                          <p className="font-medium">{property.yearBuilt}</p>
                        </div>
                      </div>
                    )}
                    {property.parking !== null &&
                      property.parking !== undefined && (
                        <div className="flex items-center gap-3">
                          <Car className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              ที่จอดรถ
                            </p>
                            <p className="font-medium">
                              {property.parking} คัน
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Amenities */}
                {amenitiesDisplay.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      สิ่งอำนวยความสะดวก
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {amenitiesDisplay.map((amenity, index) => (
                        <Badge
                          key={amenity.id || index}
                          variant="secondary"
                          className="gap-1"
                        >
                          <Check className="h-3 w-3" />
                          {amenity.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    ติดต่อเจ้าของประกาศ
                  </h3>

                  {/* Agent Info Placeholder */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">เจ้าของประกาศ</p>
                      <p className="text-sm text-muted-foreground">
                        สมาชิกตั้งแต่ 2024
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {!isBookingMode ? (
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="lg"
                        onClick={() => setIsBookingMode(true)}
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        จองอสังหานี้ (มัดจำ)
                      </Button>
                    ) : (
                      <div className="space-y-4 p-4 border rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            ระบุวันที่ต้องการจอง:
                          </label>
                          <Input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="bg-white text-black"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBookingMode(false)}
                            className="text-black"
                          >
                            ยกเลิก
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                            onClick={handleBooking}
                          >
                            ไปหน้าชำระเงิน
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                          * ค่ามัดจำ 10,000 บาท เพื่อล็อคคิวและยืนยันความสนใจ
                        </p>
                      </div>
                    )}
                    <Button variant="outline" className="w-full" size="lg">
                      <Phone className="mr-2 h-5 w-5" />
                      โทรติดต่อ
                    </Button>
                    <Button variant="ghost" className="w-full" size="sm">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      ส่งข้อความ
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">สถิติประกาศ</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">เข้าชม</span>
                      <span className="font-medium">
                        {property.views || 0} ครั้ง
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        ลงประกาศเมื่อ
                      </span>
                      <span className="font-medium">
                        {new Date(property.createdAt).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">รหัสประกาศ</span>
                      <span className="font-medium text-xs">{property.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-8 w-8" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <div className="relative w-full max-w-5xl h-[80vh] mx-4">
              <Image
                src={images[currentImageIndex]?.url || "/placeholder.jpg"}
                alt={property.title}
                fill
                sizes="100vw"
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              {currentImageIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      {/* Payment Modal */}
      <PaymentModal {...modalProps} />
    </div>
  );
}

// Loading Skeleton
function PropertySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="aspect-video rounded-lg" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
