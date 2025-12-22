"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { motion } from "framer-motion";
import { ShieldCheck, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Navbar, Footer } from "@/components/layout";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { useSession, api, propertiesService } from "@/services";
import {
  CategorySelect,
  BasicDetails,
  PropertyDetails,
  LocationSelect,
  ImageUpload,
  AmenitySelect,
} from "@/components/forms/property";

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

  // Optional Fields based on Type
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area: z.number().min(1).optional(),
  landArea: z.number().min(0).optional(),
  floor: z.number().min(0).optional(),
  totalFloors: z.number().min(0).optional(),
  yearBuilt: z.number().min(1900).max(new Date().getFullYear()).optional(),
  parking: z.number().min(0).optional(),
  building: z.string().optional(),

  // Land Calculation helpers (not sent to API)
  rai: z.number().optional(),
  ngan: z.number().optional(),
  sqWah: z.number().optional(),

  address: z.string().min(5, "กรุณาระบุที่อยู่"),
  district: z.string().min(2, "กรุณาระบุเขต/อำเภอ"),
  province: z.string().min(2, "กรุณาระบุจังหวัด"),
  postalCode: z.string().optional(),

  // New Fields
  amenityIds: z.array(z.string()).optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function PostPropertyPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch user properties to check limit
  const { data: myProperties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["my-properties"],
    queryFn: propertiesService.getMine,
    enabled: !!session?.user,
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

  const onSubmit = async (data: PropertyFormData) => {
    if (images.length === 0) {
      toast.error("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload images
      const formData = new FormData();
      images.forEach((file) => formData.append("files", file));

      interface UploadedFile {
        key: string;
        url: string;
        size: number;
        type: string;
      }

      const uploadResponse = await api.post<{
        success: boolean;
        data: UploadedFile[];
      }>("/media/upload/multiple", formData, {
        headers: { "Content-Type": undefined }, // Let browser set correct Content-Type with boundary
      });

      const uploadedFiles = uploadResponse.data.data;

      // 2. Create property
      const response = await api.post<{
        success: boolean;
        data: { id: string };
      }>("/properties", {
        ...data,
        images: uploadedFiles.map((file: UploadedFile, index: number) => ({
          url: file.url,
          isPrimary: index === 0,
          order: index,
        })),
      });

      toast.success("สร้างประกาศสำเร็จ!");
      router.push(`/properties/${response.data.data.id}`);
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถสร้างประกาศได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionPending || isLoadingProperties) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check Limit Logic
  const user = session?.user as { role?: string } | undefined;
  const isUser = user?.role === "user";
  const propertyCount = myProperties?.length || 0;
  const hasReachedLimit = isUser && propertyCount >= 1;

  if (hasReachedLimit) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  อัปเกรดเพื่อลงประกาศเพิ่ม
                </CardTitle>
                <CardDescription>
                  บัญชีผู้ใช้ทั่วไปสามารถลงประกาศได้ 1 รายการ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground text-center">
                  ขณะนี้คุณมีประกาศที่ลงไปแล้ว <strong>{propertyCount}</strong>{" "}
                  รายการ <br />
                  กรุณายืนยันตัวตนเป็น <strong>Agent</strong>{" "}
                  เพื่อลงประกาศได้ไม่จำกัด
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/become-agent" className="w-full">
                    <Button className="w-full text-lg h-12">
                      ยืนยันตัวตน (Become Agent)
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="w-full">
                    <Button variant="ghost" className="w-full">
                      กลับไปหน้า Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl space-y-6"
        >
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไป Dashboard
          </Link>

          <div>
            <h1 className="text-2xl font-bold">ลงประกาศอสังหาริมทรัพย์</h1>
            <p className="text-muted-foreground">
              กรอกข้อมูลให้ครบถ้วนเพื่อลงประกาศของคุณ
            </p>
          </div>

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
                  <ImageUpload
                    images={images}
                    setImages={setImages}
                    imagePreviews={imagePreviews}
                    setImagePreviews={setImagePreviews}
                  />
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
                          ลงประกาศ
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
