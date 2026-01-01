"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPropertySchema,
  CreatePropertyInput,
  PROPERTY_TYPE,
  LISTING_TYPE,
} from "@/schemas/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { propertyService } from "@/services/property.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import thaiAddressData from "@/app/data/thai-address.json";
import { api } from "@/lib/api";

export function PropertyForm() {
  const router = useRouter();
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [subDistricts, setSubDistricts] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);

  const form = useForm<any>({
    resolver: zodResolver(createPropertySchema) as any,
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      address: "",
      province: "",
      district: "",
      subDistrict: "",
      postalCode: "",
      amenityIds: [],
    },
  });

  const selectedProvince = form.watch("province");
  const selectedDistrict = form.watch("district");
  const selectedSubDistrict = form.watch("subDistrict");

  useEffect(() => {
    const p = [
      ...new Set(thaiAddressData.map((item: any) => item.province)),
    ].sort();
    setProvinces(p);
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const d = [
        ...new Set(
          thaiAddressData
            .filter((item: any) => item.province === selectedProvince)
            .map((item: any) => item.amphoe)
        ),
      ].sort();
      setDistricts(d);
      // Note: We don't reset here to avoid clearing values during initial render/hydration if any
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      const sd = [
        ...new Set(
          thaiAddressData
            .filter(
              (item: any) =>
                item.province === selectedProvince &&
                item.amphoe === selectedDistrict
            )
            .map((item: any) => item.district)
        ),
      ].sort();
      setSubDistricts(sd);
    } else {
      setSubDistricts([]);
    }
  }, [selectedDistrict, selectedProvince]);

  useEffect(() => {
    if (selectedSubDistrict && selectedDistrict && selectedProvince) {
      const item: any = thaiAddressData.find(
        (i: any) =>
          i.province === selectedProvince &&
          i.amphoe === selectedDistrict &&
          i.district === selectedSubDistrict
      );
      if (item) {
        form.setValue("postalCode", item.zipcode.toString());
      }
    }
  }, [selectedSubDistrict, selectedDistrict, selectedProvince, form]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res: any = await api.get("/amenities");
        setAmenities(res.data || []);
      } catch (error) {
        console.error("Failed to fetch amenities", error);
      }
    };
    fetchAmenities();
  }, []);

  async function onSubmit(data: CreatePropertyInput) {
    try {
      const property = await propertyService.create(data);
      toast.success("สร้างประกาศเรียบร้อยแล้ว");
      router.push(`/property/${property.slug}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างประกาศ"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>หัวข้อประกาศ</FormLabel>
              <FormControl>
                <Input
                  placeholder="เช่น บ้านเดี่ยว 2 ชั้น ย่านสุขุมวิท"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ประเภทอสังหาฯ</FormLabel>
                <select
                  {...field}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">เลือกประเภท</option>
                  {Object.entries(PROPERTY_TYPE).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="listingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ประเภทการประกาศ</FormLabel>
                <select
                  {...field}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">เลือกประเภท</option>
                  {Object.entries(LISTING_TYPE).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value === "sale" ? "ขาย" : "เช่า"}
                    </option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ราคา (บาท)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ห้องนอน</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ห้องน้ำ</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>พื้นที่ (ตร.ม.)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>จังหวัด</FormLabel>
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    form.setValue("district", "");
                    form.setValue("subDistrict", "");
                    form.setValue("postalCode", "");
                  }}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เขต/อำเภอ</FormLabel>
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    form.setValue("subDistrict", "");
                    form.setValue("postalCode", "");
                  }}
                  disabled={!selectedProvince}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">เลือกเขต/อำเภอ</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="subDistrict"
            render={({ field }) => (
              <FormItem>
                <FormLabel>แขวง/ตำบล</FormLabel>
                <select
                  {...field}
                  disabled={!selectedDistrict}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">เลือกแขวง/ตำบล</option>
                  {subDistricts.map((sd) => (
                    <option key={sd} value={sd}>
                      {sd}
                    </option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>รหัสไปรษณีย์</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-gray-50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ที่อยู่ (เลขที่บ้าน/ซอย/ถนน)</FormLabel>
              <FormControl>
                <Input placeholder="เช่น 123/45 ซอยสุขุมวิท 50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>สิ่งอำนวยความสะดวก (Amenities)</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-background">
            {amenities.map((amenity) => (
              <label
                key={amenity.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
              >
                <input
                  type="checkbox"
                  value={amenity.id}
                  checked={form.watch("amenityIds")?.includes(amenity.id)}
                  onChange={(e) => {
                    const currentValues = form.getValues("amenityIds") || [];
                    if (e.target.checked) {
                      form.setValue("amenityIds", [
                        ...currentValues,
                        amenity.id,
                      ]);
                    } else {
                      form.setValue(
                        "amenityIds",
                        currentValues.filter((id: string) => id !== amenity.id)
                      );
                    }
                  }}
                  className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">
                  {amenity.nameTh || amenity.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รายละเอียดเพิ่มเติม</FormLabel>
              <FormControl>
                <Textarea placeholder="รายละเอียดอื่นๆ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "กำลังบันทึก..." : "ลงประกาศ"}
        </Button>
      </form>
    </Form>
  );
}
