"use client";

import { useFormContext, Controller } from "react-hook-form";
import { ImageUpload, AmenitySelect } from "../ui";

export function Media() {
  const { control } = useFormContext();

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">รูปภาพทรัพย์สิน</h3>
          <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full">
            สูงสุด 10 รูป
          </span>
        </div>

        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageUpload value={field.value || []} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="pt-10 border-t-2 border-dashed space-y-6">
        <h3 className="text-lg font-bold">สิ่งอำนวยความสะดวก</h3>
        <Controller
          control={control}
          name="amenityIds"
          render={({ field }) => (
            <AmenitySelect
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </div>
  );
}
