"use client";

import { useFormContext, Controller } from "react-hook-form";
import { DollarSign } from "lucide-react";
import {
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { ListingType } from "@/types";
import { MaskInput } from "@/components/ui/mask-input";

const listingTypes: { value: ListingType; label: string }[] = [
  { value: "sale", label: "ขาย" },
  { value: "rent", label: "เช่า" },
];

export function BasicDetails() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedListingType = watch("listingType");

  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Name / Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            ชื่อโครงการ / ทรัพย์สิน *
          </label>
          <Input
            placeholder="เช่น: คอนโดหรู ใกล้ BTS อโศก"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">
              {errors.title.message as string}
            </p>
          )}
        </div>

        {/* Listing Type & Price Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">ประเภท *</label>
            <div className="flex rounded-md shadow-sm">
              <Controller
                name="listingType"
                control={control}
                render={({ field }) => (
                  <>
                    {listingTypes.map((type, index) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => field.onChange(type.value)}
                        className={`flex-1 py-2 px-4 text-sm font-medium border first:rounded-l-md last:rounded-r-md focus:z-10 focus:ring-2 focus:ring-primary ${
                          field.value === type.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                        } ${index > 0 ? "-ml-px" : ""}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              ราคา{selectedListingType === "rent" ? "/เดือน" : ""} *
            </label>
            <div className="relative">
              <MaskInput
                mask="currency"
                placeholder="0"
                className="pr-12 text-center"
                onValueChange={(rawValue: string) => {
                  // rawValue is the unmasked value (e.g., "20000" without formatting)
                  const numericValue = rawValue
                    ? parseFloat(rawValue.replace(/[^0-9.]/g, ""))
                    : 0;
                  setValue("price", isNaN(numericValue) ? 0 : numericValue);
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                บาท
              </span>
            </div>
            {errors.price && (
              <p className="text-xs text-destructive">
                {errors.price.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">รายละเอียด *</label>
          <textarea
            placeholder="อธิบายรายละเอียดเพิ่มเติม..."
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message as string}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
