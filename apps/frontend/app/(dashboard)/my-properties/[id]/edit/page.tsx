"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Navbar, Footer } from "@/components/layout";
import {
  Button,
  Card,
  CardContent,
  AlertDialogDescription,
  AlertDialog,
} from "@/components/ui";
import { useSession, api, propertiesService } from "@/services";
import {
  CategorySelect,
  BasicDetails,
  PropertyDetails,
  LocationSelect,
  ImageUpload,
  AmenitySelect,
} from "@/components/forms";

// Validation schema
const propertySchema = z.object({
  title: z.string().min(10, "หัวข้อต้องมีอย่างน้อย 10 ตัวอักษร"),
  description: z.string().min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร"),
  price: z.number().min(1, "กรุณาระบุราคา"),
  propertyType: z.enum([
    "condo",
    "house",
    "townhouse",
    "land",
    "apartment",
    "commercial",
  ]),
  listingType: z.enum(["sale", "rent"]),

  // Optional Fields
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area: z.number().min(1).optional(),
  landArea: z.number().min(0).optional(),
  floor: z.number().min(0).optional(),
  totalFloors: z.number().min(0).optional(),
  yearBuilt: z.number().min(1900).max(new Date().getFullYear()).optional(),
  parking: z.number().min(0).optional(),
  building: z.string().optional(),

  // Land Calculation helpers
  rai: z.number().optional(),
  ngan: z.number().optional(),
  sqWah: z.number().optional(),

  address: z.string().min(5, "กรุณาระบุที่อยู่"),
  district: z.string().min(2, "กรุณาระบุเขต/อำเภอ"),
  province: z.string().min(2, "กรุณาระบุจังหวัด"),
  postalCode: z.string().optional(),

  amenityIds: z.array(z.string()).optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface UploadedFile {
  key: string;
  url: string;
  size: number;
  type: string;
}

function EditPropertyContent() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { data: session, isPending: isSessionPending } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<(File | string)[]>([]);

  // Fetch property data
  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => propertiesService.getById(propertyId),
    enabled: !!propertyId && !!session?.user,
  });

  const methods = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      propertyType: "condo",
      listingType: "sale",
      bedrooms: 1,
      bathrooms: 1,
      floor: 1,
      amenityIds: [],
    },
  });

  // Populate form when property data is loaded
  useEffect(() => {
    if (property) {
      methods.reset({
        title: property.title,
        description: property.description || "",
        price: Number(property.price),
        propertyType: property.propertyType as any,
        listingType: property.listingType as any,
        bedrooms: property.bedrooms || undefined,
        bathrooms: property.bathrooms || undefined,
        area: property.area ? Number(property.area) : undefined,
        landArea: property.landArea ? Number(property.landArea) : undefined,
        floor: property.floor || undefined,
        yearBuilt: property.yearBuilt || undefined,
        address: property.address || "",
        district: property.district || "",
        province: property.province || "",
        postalCode: property.postalCode || "",
        amenityIds: [],
      });

      // Set existing images
      if (property.images && property.images.length > 0) {
        // Sort by order and use URLs
        const sortedImages = [...property.images]
          .sort((a, b) => a.order - b.order)
          .map((img) => img.url);
        setImages(sortedImages);
      } else if (property.thumbnailUrl) {
        setImages([property.thumbnailUrl]);
      }
    }
  }, [property, methods]);

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      let finalImageUrls: { url: string; isPrimary: boolean; order: number }[] =
        [];

      // 1. Separate new files and existing URLs
      const filesToUpload = images.filter(
        (img): img is File => img instanceof File
      );
      const existingUrls = images.filter(
        (img): img is string => typeof img === "string"
      );

      // 2. Upload new files if any
      let uploadedFiles: UploadedFile[] = [];
      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach((file) => formData.append("files", file));
        formData.append("type", "property");

        const uploadResponse = await api.post<{
          success: boolean;
          data: UploadedFile[];
        }>("/media/upload/multiple", formData, {
          headers: { "Content-Type": undefined },
        });

        uploadedFiles = uploadResponse.data;
      }

      // 3. Reconstruct the image list in the user's order
      let uploadIndex = 0;
      finalImageUrls = images.map((img, index) => {
        let url: string;
        if (img instanceof File) {
          url = uploadedFiles[uploadIndex].url;
          uploadIndex++;
        } else {
          url = img;
        }

        return {
          url,
          isPrimary: index === 0,
          order: index,
        };
      });

      // Update property
      await api.put(`/properties/${propertyId}`, {
        ...data,
        images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
      });

      toast.success("แก้ไขประกาศสำเร็จ! รอ admin ตรวจสอบอีกครั้ง");
      router.push("/my-properties");
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถแก้ไขประกาศได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <AlertDialog>
              <AlertDialogDescription>
                ไม่พบประกาศนี้หรือคุณไม่มีสิทธิ์แก้ไข
              </AlertDialogDescription>
            </AlertDialog>
            <Link href="/my-properties" className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับไปหน้าประกาศของฉัน
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl space-y-6"
        >
          {/* Back Button */}
          <Link
            href="/my-properties"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าประกาศของฉัน
          </Link>

          <div>
            <h1 className="text-2xl font-bold">แก้ไขประกาศ</h1>
            <p className="text-muted-foreground">
              แก้ไขข้อมูลประกาศของคุณ (หลังแก้ไขจะต้องรอ admin ตรวจสอบอีกครั้ง)
            </p>
          </div>

          {/* Status Alert */}
          {property.status === "rejected" && (
            <AlertDialog>
              <AlertDialogDescription>
                ประกาศนี้ถูกปฏิเสธ:{" "}
                {(property as any).rejectionReason || "ไม่ระบุเหตุผล"}
              </AlertDialogDescription>
            </AlertDialog>
          )}

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <div className="space-y-6">
                {/* 1. Category */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                      1
                    </span>
                    ประเภทอสังหา
                  </h3>
                  <CategorySelect />
                </div>

                {/* 2. Basic Info & Location */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                      2
                    </span>
                    ข้อมูลและทำเล
                  </h3>
                  <BasicDetails />
                  <LocationSelect />
                </div>

                {/* 3. Details */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                      3
                    </span>
                    รายละเอียด
                  </h3>
                  <PropertyDetails />
                </div>

                {/* 4. Amenities */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                      4
                    </span>
                    สิ่งอำนวยความสะดวก
                  </h3>
                  <AmenitySelect />
                </div>

                {/* 5. Images */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                      5
                    </span>
                    รูปภาพ
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    อัปโหลดรูปใหม่เพื่อแทนที่รูปเดิม
                    หรือปล่อยว่างเพื่อใช้รูปเดิม
                  </p>
                  <ImageUpload value={images} onChange={setImages} />
                </div>
              </div>

              {/* Submit */}
              <div className="sticky bottom-4 z-10">
                <Card className="border-t shadow-lg bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-4 flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      className="flex-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          บันทึกการแก้ไข
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </form>
          </FormProvider>
        </motion.div>
      </main>
    </div>
  );
}

export default function EditPropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <EditPropertyContent />
    </Suspense>
  );
}
