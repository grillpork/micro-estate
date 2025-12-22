"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  MapPin,
  Bed,
  Bath,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Navbar, Footer } from "@/components/layout";
import {
  Button,
  Card,
  CardContent,
  Badge,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useSession, propertiesService } from "@/services";
import { formatPrice } from "@/lib/utils";

// Status config
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "รอตรวจสอบ", variant: "secondary" },
  active: { label: "เผยแพร่แล้ว", variant: "default" },
  pending: { label: "รอดำเนินการ", variant: "secondary" },
  rejected: { label: "ถูกปฏิเสธ", variant: "destructive" },
  sold: { label: "ขายแล้ว", variant: "outline" },
  rented: { label: "ปล่อยเช่าแล้ว", variant: "outline" },
  inactive: { label: "ไม่ใช้งาน", variant: "outline" },
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  condo: "คอนโด",
  house: "บ้านเดี่ยว",
  townhouse: "ทาวน์เฮาส์",
  land: "ที่ดิน",
  apartment: "อพาร์ทเมนต์",
  commercial: "อาคารพาณิชย์",
};

export default function MyPropertiesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } = useSession();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data: properties,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-properties"],
    queryFn: propertiesService.getMine,
    enabled: !!session?.user,
  });

  const deleteMutation = useMutation({
    mutationFn: propertiesService.delete,
    onSuccess: () => {
      toast.success("ลบประกาศสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error("ไม่สามารถลบประกาศได้");
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (isSessionPending || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">ประกาศของฉัน</h1>
            <p className="text-muted-foreground mt-1">
              จัดการประกาศอสังหาริมทรัพย์ของคุณ
            </p>
          </div>
          <Link href="/post-property">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              ลงประกาศใหม่
            </Button>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!error && properties?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">ยังไม่มีประกาศ</h3>
                <p className="text-muted-foreground mb-6">
                  เริ่มต้นลงประกาศอสังหาริมทรัพย์แรกของคุณ
                </p>
                <Link href="/post-property">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    ลงประกาศใหม่
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Properties List */}
        {!error && properties && properties.length > 0 && (
          <div className="space-y-4">
            {properties.map((property: any, index: number) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0">
                      {property.thumbnailUrl ? (
                        <Image
                          src={property.thumbnailUrl}
                          alt={property.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 192px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">
                            ไม่มีรูปภาพ
                          </span>
                        </div>
                      )}
                      {/* Status Badge */}
                      <Badge
                        className="absolute top-2 left-2"
                        variant={
                          STATUS_CONFIG[property.status]?.variant || "secondary"
                        }
                      >
                        {STATUS_CONFIG[property.status]?.label ||
                          property.status}
                      </Badge>
                    </div>

                    {/* Content */}
                    <CardContent className="flex-1 p-4 md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title & Type */}
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {PROPERTY_TYPE_LABELS[property.propertyType] ||
                                property.propertyType}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {property.listingType === "sale" ? "ขาย" : "เช่า"}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg truncate mb-2">
                            {property.title}
                          </h3>

                          {/* Location */}
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1 shrink-0" />
                            <span className="truncate">
                              {property.district}, {property.province}
                            </span>
                          </div>

                          {/* Features */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            {property.bedrooms !== null && (
                              <span className="flex items-center gap-1">
                                <Bed className="h-4 w-4" />
                                {property.bedrooms}
                              </span>
                            )}
                            {property.bathrooms !== null && (
                              <span className="flex items-center gap-1">
                                <Bath className="h-4 w-4" />
                                {property.bathrooms}
                              </span>
                            )}
                            {property.area && (
                              <span>{property.area} ตร.ม.</span>
                            )}
                          </div>

                          {/* Price */}
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(Number(property.price))}
                            {property.listingType === "rent" && (
                              <span className="text-sm font-normal text-muted-foreground">
                                /เดือน
                              </span>
                            )}
                          </p>

                          {/* Rejection Reason */}
                          {property.status === "rejected" &&
                            property.rejectionReason && (
                              <div className="mt-3 p-2 bg-destructive/10 rounded text-sm text-destructive">
                                <strong>เหตุผลที่ปฏิเสธ:</strong>{" "}
                                {property.rejectionReason}
                              </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {/* Desktop Actions */}
                          <div className="hidden md:flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/property/${property.id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              ดู
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/my-properties/${property.id}/edit`
                                )
                              }
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              แก้ไข
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeleteId(property.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  ลบ
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ยืนยันการลบประกาศ
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    คุณแน่ใจหรือไม่ว่าต้องการลบประกาศ "
                                    {property.title}"?
                                    การกระทำนี้ไม่สามารถย้อนกลับได้
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setDeleteId(null)}
                                  >
                                    ยกเลิก
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    {deleteMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "ลบประกาศ"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>

                          {/* Mobile Dropdown */}
                          <div className="md:hidden">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/property/${property.id}`)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  ดูประกาศ
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/my-properties/${property.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  แก้ไข
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteId(property.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  ลบ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {property.views || 0} ครั้งที่ดู
                        </span>
                        <span>
                          ลงเมื่อ{" "}
                          {new Date(property.createdAt).toLocaleDateString(
                            "th-TH",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
