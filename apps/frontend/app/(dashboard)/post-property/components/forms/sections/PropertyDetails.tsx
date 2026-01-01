"use client";

import { useFormContext, Controller } from "react-hook-form";
import { NumberSelect } from "../ui";

export function PropertyDetails() {
  const { control, watch } = useFormContext();
  const propertyType = watch("propertyType");

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <PropertyDetailsFields propertyType={propertyType} control={control} />
        <AreaFields propertyType={propertyType} control={control} />
      </div>

      <LandDetailsFields propertyType={propertyType} control={control} />
    </div>
  );
}

// Sub-components adapted from original files

function PropertyDetailsFields({
  propertyType,
  control,
}: {
  propertyType?: string;
  control: any;
}) {
  if (propertyType === "land" || propertyType === "commercial") return null;

  return (
    <>
      <div className="space-y-3">
        <label className="text-sm font-semibold text-muted-foreground">
          ห้องนอน
        </label>
        <Controller
          control={control}
          name="bedrooms"
          render={({ field }) => (
            <NumberSelect
              value={field.value}
              onChange={field.onChange}
              max={5}
              placeholder="-"
              suffix=" ห้อง"
              className="h-12"
            />
          )}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-muted-foreground">
          ห้องน้ำ
        </label>
        <Controller
          control={control}
          name="bathrooms"
          render={({ field }) => (
            <NumberSelect
              value={field.value}
              onChange={field.onChange}
              max={10}
              placeholder="-"
              suffix=" ห้อง"
              className="h-12"
            />
          )}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-muted-foreground">
          ที่จอดรถ
        </label>
        <Controller
          control={control}
          name="parking"
          render={({ field }) => (
            <NumberSelect
              value={field.value}
              onChange={field.onChange}
              max={5}
              placeholder="-"
              suffix=" คัน"
              className="h-12"
            />
          )}
        />
      </div>

      {propertyType === "condo" && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted-foreground">
            ชั้นที่
          </label>
          <Controller
            control={control}
            name="floor"
            render={({ field }) => (
              <NumberSelect
                value={field.value}
                onChange={field.onChange}
                max={50}
                placeholder="-"
                suffix=" "
                className="h-12"
              />
            )}
          />
        </div>
      )}
    </>
  );
}

function AreaFields({
  propertyType,
  control,
}: {
  propertyType?: string;
  control: any;
}) {
  if (propertyType === "land") return null;

  return (
    <>
      <div className="space-y-3">
        <label className="text-sm font-semibold text-muted-foreground">
          พื้นที่ใช้สอย (ตร.ม.)
        </label>
        <Controller
          control={control}
          name="area"
          render={({ field }) => (
            <NumberInput
              value={field.value}
              onValueChange={field.onChange}
              placeholder="ระบุรนาดพื้นที่"
              suffix=" ตร.ม."
              className="h-12"
            />
          )}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-muted-foreground">
          ปีที่สร้างเสร็จ (พ.ศ.)
        </label>
        <Controller
          control={control}
          name="yearBuilt"
          render={({ field }) => (
            <NumberInput
              value={field.value}
              onValueChange={field.onChange}
              placeholder="เช่น 2567"
              decimalScale={0}
              className="h-12"
            />
          )}
        />
      </div>

      {propertyType !== "condo" && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted-foreground">
            จำนวนชั้น
          </label>
          <Controller
            control={control}
            name="totalFloors"
            render={({ field }) => (
              <NumberSelect
                value={field.value}
                onChange={field.onChange}
                max={5}
                placeholder="-"
                suffix=" ชั้น"
                className="h-12"
              />
            )}
          />
        </div>
      )}
    </>
  );
}

function LandDetailsFields({
  propertyType,
  control,
}: {
  propertyType?: string;
  control: any;
}) {
  const showLandFields = [
    "land",
    "house",
    "townhouse",
    "commercial",
    "warehouse",
  ].includes(propertyType || "");

  if (!showLandFields) return null;

  return (
    <div className="space-y-4 pt-6 border-t border-dashed">
      <h3 className="text-lg font-bold">ขนาดที่ดิน</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted-foreground">
            ไร่
          </label>
          <Controller
            control={control}
            name="rai"
            render={({ field }) => (
              <NumberInput
                value={field.value}
                onValueChange={field.onChange}
                placeholder="0"
                suffix=" ไร่"
                decimalScale={0}
                className="h-12"
              />
            )}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted-foreground">
            งาน
          </label>
          <Controller
            control={control}
            name="ngan"
            render={({ field }) => (
              <NumberInput
                value={field.value}
                onValueChange={field.onChange}
                placeholder="0"
                suffix=" งาน"
                decimalScale={0}
                className="h-12"
              />
            )}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted-foreground">
            ตารางวา
          </label>
          <Controller
            control={control}
            name="sqWah"
            render={({ field }) => (
              <NumberInput
                value={field.value}
                onValueChange={field.onChange}
                placeholder="0"
                suffix=" ตร.ว."
                className="h-12"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
