"use client";

import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Bed, Bath, Car, Ruler, Building, Calendar } from "lucide-react";
import {
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";

const CounterInput = ({
  name,
  label,
  icon: Icon,
}: {
  name: string;
  label: string;
  icon?: any;
}) => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center border rounded-md h-10 w-full bg-background">
            <button
              type="button"
              onClick={() =>
                field.onChange(Math.max(0, (field.value || 0) - 1))
              }
              className="px-3 h-full hover:bg-muted text-muted-foreground border-r transition-colors"
            >
              -
            </button>
            <input
              type="number"
              className="flex-1 text-center h-full border-none focus:ring-0 w-full min-w-0 bg-transparent"
              value={field.value || 0}
              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
            />
            <button
              type="button"
              onClick={() => field.onChange((field.value || 0) + 1)}
              className="px-3 h-full hover:bg-muted text-muted-foreground border-l transition-colors"
            >
              +
            </button>
          </div>
        )}
      />
    </div>
  );
};

export function PropertyDetails() {
  const { register, watch, setValue, control } = useFormContext();
  const propertyType = watch("propertyType");

  const isLand = propertyType === "land";
  const isCondo = propertyType === "condo" || propertyType === "apartment";

  // Land Area Calculation Logic
  const rai = watch("rai") || 0;
  const ngan = watch("ngan") || 0;
  const sqWah = watch("sqWah") || 0;

  useEffect(() => {
    // Only calculate if inputting land details
    if (!isCondo) {
      const totalSqWah =
        parseFloat(rai) * 400 + parseFloat(ngan) * 100 + parseFloat(sqWah);
      setValue("landArea", totalSqWah);
    }
  }, [rai, ngan, sqWah, setValue, isCondo]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายละเอียดอสังหา</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* LAND SIZE SECTION: For Land, House, Townhouse, Commercial */}
        {!isCondo && (
          <div className="space-y-2">
            <label className="text-sm font-medium">ขนาดที่ดิน</label>
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  className="pr-8 text-center"
                  {...register("rai", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ไร่
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  className="pr-10 text-center"
                  {...register("ngan", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  งาน
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  className="pr-12 text-center"
                  {...register("sqWah", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ตร.วา
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ROOM DETAILS: For House, Condo, Townhouse */}
        {!isLand && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CounterInput name="bedrooms" label="ห้องนอน" icon={Bed} />
            <CounterInput name="bathrooms" label="ห้องน้ำ" icon={Bath} />

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                พื้นที่ใช้สอย
              </label>
              <div className="relative">
                <Input
                  {...register("area", { valueAsNumber: true })}
                  placeholder="0"
                  className="text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ตร.ม.
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                ที่จอดรถ
              </label>
              <Input
                type="number"
                {...register("parking", { valueAsNumber: true })}
                placeholder="0"
                className="text-center"
              />
            </div>
          </div>
        )}

        {/* ADDITIONAL DETAILS: Floor, Year Built (Condo/House) */}
        {!isLand && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ชั้น (Floor)</label>
              <Input
                placeholder="เช่น 12A"
                {...register("floor", { valueAsNumber: true })}
              />
            </div>
            {isCondo && (
              <div className="space-y-2">
                <label className="text-sm font-medium">ตึก / อาคาร</label>
                <Input
                  placeholder="เช่น อาคาร B"
                  {...register("building")} // 'building' field needs to be added to schema if not present, otherwise generic info
                />
              </div>
            )}
            {!isCondo && (
              <div className="space-y-2">
                <label className="text-sm font-medium">จำนวนชั้นทั้งหมด</label>
                <Input
                  type="number"
                  {...register("totalFloors", { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
