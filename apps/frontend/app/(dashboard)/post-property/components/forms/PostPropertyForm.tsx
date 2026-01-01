"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, PropertyFormValues } from "@/lib/validations/property";
import { toast } from "sonner";
import { Button, Card, CardContent } from "@/components/ui";
import { api } from "@/services";
import {
  Building2,
  MapPin,
  Home,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import { BasicInfo } from "./sections/BasicInfo";
import { Location } from "./sections/Location";
import { TypeFields } from "./sections/TypeFields";
import { Media } from "./sections/Media";

interface UploadedFile {
  key: string;
  url: string;
  size: number;
  type: string;
}

export function PostPropertyForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    shouldUnregister: true,
    defaultValues: {
      listingType: "sale",
      propertyType: "condo",
      amenityIds: [],
      images: [],
      title: "",
      description: "",
      price: undefined,
      area: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      floor: undefined,
      parking: undefined,
      rai: undefined,
      ngan: undefined,
      sqWah: undefined,
      landArea: undefined,
      yearBuilt: undefined,
      totalFloors: undefined,
    },
    mode: "onSubmit",
  });

  const { handleSubmit, watch, setValue } = methods;

  const onSubmit = async (data: PropertyFormValues) => {
    setIsLoading(true);
    try {
      const images = data.images || [];
      let finalImageUrls: { url: string; isPrimary: boolean; order: number }[] =
        [];

      if (images.length > 0) {
        const filesToUpload = images.filter(
          (img: File | string): img is File => img instanceof File
        );

        if (filesToUpload.length > 0) {
          const formData = new FormData();
          filesToUpload.forEach((file: File) => formData.append("files", file));
          formData.append("type", "property");

          const uploadResponse = await api.post<{
            success: boolean;
            data: UploadedFile[];
          }>("/media/upload/multiple", formData, {
            headers: { "Content-Type": undefined },
          });

          const uploadedFiles = uploadResponse.data;

          finalImageUrls = uploadedFiles.map((file, index) => ({
            url: file.url,
            isPrimary: index === 0,
            order: index,
          }));
        }
      }

      const propertyData = {
        title: data.title,
        description: data.description,
        price: data.price,
        propertyType: data.propertyType,
        listingType: data.listingType,
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        area: data.area,
        floor: data.floor || null,
        parking: data.parking || null,
        address: data.address,
        province: data.province,
        district: data.district,
        subDistrict: data.subDistrict,
        postalCode: data.postalCode || null,
        amenityIds: data.amenityIds || [],
        images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
        rai: data.rai || null,
        ngan: data.ngan || null,
        sqWah: data.sqWah || null,
        landArea: data.landArea || null,
        totalFloors: data.totalFloors || null,
        yearBuilt: data.yearBuilt || null,
      };

      await api.post("/properties", propertyData);

      toast.success("ลงประกาศสำเร็จ! รอ admin ตรวจสอบ");
      router.push("/my-properties");
    } catch (error: any) {
      console.error("Failed to post property:", error);
      toast.error(
        error.response?.data?.message || "ไม่สามารถลงประกาศได้ กรุณาลองอีกครั้ง"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const propertyType = watch("propertyType");
  const rai = watch("rai");
  const ngan = watch("ngan");
  const sqWah = watch("sqWah");

  // Calculate total land area in sq wah
  useEffect(() => {
    if (
      propertyType === "house" ||
      propertyType === "land" ||
      propertyType === "townhouse"
    ) {
      const totalSqWah =
        (Number(rai) || 0) * 400 +
        (Number(ngan) || 0) * 100 +
        (Number(sqWah) || 0);
      setValue("landArea", totalSqWah > 0 ? totalSqWah : undefined);
    }
  }, [rai, ngan, sqWah, propertyType, setValue]);

  const SectionHeader = ({
    icon: Icon,
    title,
    description,
    id,
  }: {
    icon: any;
    title: string;
    description?: string;
    id?: string;
  }) => (
    <div className="flex items-start gap-4 mb-8" id={id}>
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-32">
          {/* 1. Basic Info */}
          <section className="scroll-mt-20">
            <SectionHeader
              id="basic-info"
              icon={Building2}
              title="ข้อมูลเบื้องต้น"
              description="ระบุประเภทและหัวข้อประกาศของคุณ"
            />
            <Card className="border-none shadow-sm bg-background/60 backdrop-blur-xl">
              <CardContent className="p-8">
                <BasicInfo />
              </CardContent>
            </Card>
          </section>

          {/* 2. Location */}
          <section className="scroll-mt-20">
            <SectionHeader
              id="location"
              icon={MapPin}
              title="ทำเลที่ตั้ง"
              description="ระบุที่ตั้งเพื่อให้ผู้ซื้อค้นหาได้ง่ายขึ้น"
            />
            <Card className="border-none shadow-sm bg-background/60 backdrop-blur-xl">
              <CardContent className="p-8">
                <Location />
              </CardContent>
            </Card>
          </section>

          {/* 3. Details */}
          <section className="scroll-mt-20">
            <SectionHeader
              id="details"
              icon={Home}
              title="รายละเอียดเชิงลึก"
              description="ข้อมูลขนาด พื้นที่ และฟังก์ชั่นการใช้งาน"
            />
            <Card className="border-none shadow-sm bg-background/60 backdrop-blur-xl">
              <CardContent className="p-8">
                <TypeFields />
              </CardContent>
            </Card>
          </section>

          {/* 4. Media & Amenities */}
          <section className="scroll-mt-20">
            <SectionHeader
              id="media"
              icon={ImageIcon}
              title="รูปภาพและสิ่งอำนวยความสะดวก"
              description="ภาพพรีวิวช่วยในการตัดสินใจได้ดีที่สุด"
            />
            <Card className="border-none shadow-sm bg-background/60 backdrop-blur-xl">
              <CardContent className="p-8">
                <Media />
              </CardContent>
            </Card>
          </section>

          {/* Sticky Actions Bar */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 md:px-0">
            <Card className="bg-background/80 backdrop-blur-xl border-2 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-muted-foreground">
                    กรุณาตรวจสอบข้อมูลก่อนลงประกาศ
                  </p>
                  <p className="text-xs text-muted-foreground">
                    หลังจากลงประกาศแล้ว เจ้าหน้าที่จะทำการตรวจสอบข้อมูล
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 md:flex-none h-12 px-8 rounded-2xl font-bold"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 md:flex-none h-12 px-12 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        กำลังลงประกาศ...
                      </>
                    ) : (
                      "ยืนยันลงประกาศ"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
