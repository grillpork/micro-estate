"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input, Textarea, SelectField, CurrencyInput } from "../ui";

const LISTING_TYPES = [
  { value: "sale", label: "ขาย" },
  { value: "rent", label: "เช่า" },
];

const PROPERTY_TYPES = [
  { value: "condo", label: "คอนโด" },
  { value: "house", label: "บ้านเดี่ยว" },
  { value: "townhouse", label: "ทาวน์โฮม" },
  { value: "land", label: "ที่ดิน" },
  { value: "commercial", label: "พาณิชย์" },
  { value: "apartment", label: "อพาร์ทเมนท์" },
  { value: "hotel", label: "โรงแรม" },
  { value: "warehouse", label: "โกดัง" },
];

export function BasicInfo() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted-foreground">
            ประเภทประกาศ
          </label>
          <Controller
            control={control}
            name="listingType"
            render={({ field }) => (
              <SelectField
                options={LISTING_TYPES}
                value={field.value}
                onChange={field.onChange}
                placeholder="เลือกประเภทประกาศ"
              />
            )}
          />
          {errors.listingType && (
            <p className="text-xs text-destructive">
              {errors.listingType.message as string}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted-foreground">
            ประเภทอสังหาฯ
          </label>
          <Controller
            control={control}
            name="propertyType"
            render={({ field }) => (
              <SelectField
                options={PROPERTY_TYPES}
                value={field.value}
                onChange={field.onChange}
                placeholder="เลือกประเภทอสังหาฯ"
              />
            )}
          />
          {errors.propertyType && (
            <p className="text-xs text-destructive">
              {errors.propertyType.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-muted-foreground">
          หัวข้อประกาศ
        </label>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              placeholder="เช่น คอนโดหรูติดรถไฟฟ้า 2 ห้องนอน"
              className="h-12 rounded-xl border-2 text-base px-4"
              {...field}
            />
          )}
        />
        {errors.title && (
          <p className="text-xs text-destructive">
            {errors.title.message as string}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-muted-foreground">
          ราคา (บาท)
        </label>
        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onValueChange={field.onChange}
              placeholder="ระบุราคา"
            />
          )}
        />
        {errors.price && (
          <p className="text-xs text-destructive">
            {errors.price.message as string}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-muted-foreground">
          รายละเอียดเพิ่มเติม
        </label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              placeholder="ระบุรายละเอียดที่น่าสนใจของทรัพย์สิน..."
              className="min-h-[150px] rounded-xl border-2 text-base p-4 resize-none"
              {...field}
            />
          )}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
