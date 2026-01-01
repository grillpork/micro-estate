"use client";

import { useFormContext } from "react-hook-form";
import { MapPin } from "lucide-react";
import { Input } from "../ui";
import { thaiAddressData, provinces } from "@/data/thai-address";

export function Location() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const selectedProvince = watch("province");
  const selectedDistrict = watch("district");
  const selectedSubDistrict = watch("subDistrict");

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const province = e.target.value;
    setValue("province", province);
    setValue("district", ""); // Reset district
    setValue("subDistrict", ""); // Reset sub-district
    setValue("postalCode", ""); // Reset postal code
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setValue("district", district);
    setValue("subDistrict", ""); // Reset sub-district
    setValue("postalCode", ""); // Reset postal code
  };

  const handleSubDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subDistrict = e.target.value;
    setValue("subDistrict", subDistrict);

    // Auto-fill postal code based on sub-district (or district fallback)
    if (
      selectedProvince &&
      selectedDistrict &&
      thaiAddressData[selectedProvince]?.districts[selectedDistrict]
    ) {
      const getZip =
        thaiAddressData[selectedProvince].districts[selectedDistrict]
          .getZipcode;
      const zip = getZip(subDistrict);
      setValue("postalCode", zip);
    }
  };

  // Logic to get lists
  const districtsMap = selectedProvince
    ? thaiAddressData[selectedProvince]?.districts || {}
    : {};
  const districts = Object.keys(districtsMap);

  const subDistricts =
    selectedProvince && selectedDistrict && districtsMap[selectedDistrict]
      ? districtsMap[selectedDistrict].subDistricts
      : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">ที่อยู่ / ชื่อโครงการ *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="บ้านเลขที่, ซอย, ถนน หรือชื่อหมู่บ้าน"
            className="pl-10 h-12 rounded-xl"
            {...register("address")}
          />
        </div>
        {errors.address && (
          <p className="text-xs text-destructive">
            {errors.address.message as string}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* PROVINCE SELECT */}
        <div className="space-y-2">
          <label className="text-sm font-medium">จังหวัด *</label>
          <div className="relative">
            <select
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              {...(() => {
                const { onChange, ...rest } = register("province");
                return {
                  ...rest,
                  onChange: (e) => {
                    onChange(e);
                    handleProvinceChange(e);
                  },
                };
              })()}
              value={selectedProvince || ""}
            >
              <option value="">เลือกจังหวัด</option>
              {provinces
                .filter((p) => !!p)
                .map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
            </select>
          </div>
          {errors.province && (
            <p className="text-xs text-destructive">
              {errors.province.message as string}
            </p>
          )}
        </div>

        {/* DISTRICT SELECT */}
        <div className="space-y-2">
          <label className="text-sm font-medium">เขต/อำเภอ *</label>
          <div className="relative">
            <select
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              {...(() => {
                const { onChange, ...rest } = register("district");
                return {
                  ...rest,
                  onChange: (e) => {
                    onChange(e);
                    handleDistrictChange(e);
                  },
                };
              })()}
              value={selectedDistrict || ""}
            >
              <option value="">เลือกเขต/อำเภอ</option>
              {districts
                .filter((d) => !!d)
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>
          {errors.district && (
            <p className="text-xs text-destructive">
              {errors.district.message as string}
            </p>
          )}
        </div>

        {/* SUB-DISTRICT SELECT */}
        <div className="space-y-2">
          <label className="text-sm font-medium">แขวง/ตำบล *</label>
          <div className="relative">
            <select
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              {...(() => {
                const { onChange, ...rest } = register("subDistrict");
                return {
                  ...rest,
                  onChange: (e) => {
                    onChange(e);
                    handleSubDistrictChange(e);
                  },
                };
              })()}
              value={selectedSubDistrict || ""}
            >
              <option value="">เลือกแขวง/ตำบล</option>
              {subDistricts
                .filter((sd) => !!sd)
                .map((sd, i) => (
                  <option key={`${sd}-${i}`} value={sd}>
                    {sd}
                  </option>
                ))}
            </select>
          </div>
          {errors.subDistrict && (
            <p className="text-xs text-destructive">
              {errors.subDistrict.message as string}
            </p>
          )}
        </div>

        {/* POSTAL CODE (Auto-filled) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">รหัสไปรษณีย์</label>
          <Input
            placeholder="-"
            {...register("postalCode")}
            readOnly
            className="bg-muted text-muted-foreground cursor-not-allowed h-12 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
