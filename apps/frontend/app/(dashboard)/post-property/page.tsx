"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  FormProvider,
  useFormContext,
  Controller,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, PropertyFormValues } from "@/lib/validations/property";
import { toast } from "sonner";
import { api } from "@/services";
import { thaiAddressData, provinces } from "@/data/thai-address";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import {
  Building2,
  MapPin,
  Home,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Check,
  UploadCloud,
  X,
  ImagePlus,
  ChevronDown,
} from "lucide-react";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

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

interface Amenity {
  id: string;
  name: string;
  nameTh?: string | null;
  category: string;
}

const PROPERTY_FIELD_CONFIG: Record<
  string,
  { fields: string[]; hasLand: boolean }
> = {
  condo: {
    fields: ["bedrooms", "bathrooms", "parking", "floor", "area", "yearBuilt"],
    hasLand: false,
  },
  house: {
    fields: [
      "bedrooms",
      "bathrooms",
      "parking",
      "area",
      "yearBuilt",
      "totalFloors",
    ],
    hasLand: true,
  },
  townhouse: {
    fields: [
      "bedrooms",
      "bathrooms",
      "parking",
      "area",
      "yearBuilt",
      "totalFloors",
    ],
    hasLand: true,
  },
  land: {
    fields: [],
    hasLand: true,
  },
  commercial: {
    fields: ["area", "yearBuilt", "totalFloors"],
    hasLand: true,
  },
  apartment: {
    fields: [
      "bedrooms",
      "bathrooms",
      "parking",
      "area",
      "yearBuilt",
      "totalFloors",
    ],
    hasLand: false,
  },
  hotel: {
    fields: [
      "bedrooms",
      "bathrooms",
      "parking",
      "area",
      "yearBuilt",
      "totalFloors",
    ],
    hasLand: false,
  },
  warehouse: {
    fields: ["area", "yearBuilt", "totalFloors"],
    hasLand: true,
  },
};

// ============================================================================
// UI COMPONENTS (INLINED)
// ============================================================================

const Label = ({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn(
      "text-sm font-semibold text-muted-foreground block mb-2",
      className
    )}
    {...props}
  >
    {children}
  </label>
);

const Input = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

const Textarea = ({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      "flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

const Button = ({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Select using native HTML select for maximum "hardcoded" feel/portability
const NativeSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  ...props
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Standard change handler
  placeholder?: string;
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-12 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={value || ""}
        onChange={onChange}
        {...props}
      >
        <option value="" disabled>
          {placeholder || "Select..."}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  );
};

// --- COMPLEX UI COMPONENTS ---

function CurrencyInput({
  value,
  onValueChange,
  className,
  ...props
}: Omit<NumericFormatProps, "value" | "customInput"> & {
  value?: number | string;
  onValueChange: (value: number | undefined) => void;
}) {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        onValueChange(values.floatValue);
      }}
      thousandSeparator=","
      decimalScale={2}
      customInput={Input}
      className={cn("h-12 rounded-xl text-base", className)}
      {...props}
    />
  );
}

function NumberInput({
  value,
  onValueChange,
  suffix,
  className,
  ...props
}: Omit<NumericFormatProps, "value" | "customInput"> & {
  value?: number | string;
  onValueChange: (value: number | undefined) => void;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <NumericFormat
        value={value}
        onValueChange={(values) => {
          onValueChange(values.floatValue);
        }}
        thousandSeparator=","
        allowNegative={false}
        customInput={Input}
        className={cn(
          "h-12 rounded-xl text-base",
          suffix && "pr-12",
          className
        )}
        {...props}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          {suffix}
        </div>
      )}
    </div>
  );
}

function NumberSelect({
  value,
  onChange,
  max = 10,
  placeholder,
  suffix = "",
  className,
}: {
  value?: number | string;
  onChange: (value: number) => void;
  max?: number;
  placeholder?: string;
  suffix?: string;
  className?: string;
}) {
  const options = Array.from({ length: max }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}${suffix}`,
  }));

  return (
    <NativeSelect
      value={value?.toString()}
      onChange={(e) => onChange(Number(e.target.value))}
      options={options}
      placeholder={placeholder}
      className={className}
    />
  );
}

function ImageUpload({
  value = [],
  onChange,
}: {
  value: (File | string)[];
  onChange: (value: (File | string)[]) => void;
}) {
  // Clean up object URLs
  useEffect(() => {
    return () => {
      value.forEach((item) => {
        if (item instanceof File) {
          // URL.revokeObjectURL was not called here in original, keeping consistent
        }
      });
    };
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const remainingSlots = 10 - value.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      if (filesToAdd.length > 0) {
        onChange([...value, ...filesToAdd]);
      }
    },
    [value, onChange]
  );

  const removeImage = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const getPreviewUrl = (item: File | string) => {
    if (typeof item === "string") return item;
    return URL.createObjectURL(item);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 10 - value.length,
    disabled: value.length >= 10,
  });

  return (
    <div className="space-y-4">
      {(value.length === 0 || isDragActive) && (
        <div
          {...getRootProps()}
          className={cn(
            "border-3 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 bg-muted/20",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="h-20 w-20 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
            <UploadCloud
              className={cn(
                "h-10 w-10 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold">
              {isDragActive
                ? "วางรูปภาพที่นี่"
                : "คลิกเพื่อเลือกรูปภาพ หรือลากวาง"}
            </p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG, WEBP (สูงสุด 10 รูป)
            </p>
          </div>
        </div>
      )}

      {value.length > 0 && !isDragActive && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
          {value.map((item, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={getPreviewUrl(item)}
                alt={`Property ${index + 1}`}
                className="h-full w-full rounded-2xl object-cover ring-1 ring-border bg-muted shadow-sm"
              />
              {index === 0 && (
                <div className="absolute left-2 top-2 z-10 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/50 text-white backdrop-blur-md">
                  รูปหลัก
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-sm transform scale-90 hover:scale-100 duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {value.length < 10 && (
            <div
              {...getRootProps()}
              className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer text-muted-foreground hover:text-primary bg-muted/20"
            >
              <input {...getInputProps()} />
              <ImagePlus className="h-8 w-8 mb-2" />
              <span className="text-xs font-bold">เพิ่มรูปภาพ</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AmenitySelect({
  value = [],
  onChange,
  amenities = [], // Receive amenities as prop
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
  amenities: Amenity[];
}) {
  const selectedAmenities = value;

  const toggleAmenity = (id: string) => {
    const current = selectedAmenities;
    let newValue: string[];
    if (current.includes(id)) {
      newValue = current.filter((item) => item !== id);
    } else {
      newValue = [...current, id];
    }
    onChange?.(newValue);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {amenities.map((amenity) => {
        const isSelected = selectedAmenities.includes(amenity.id);
        // Prefer Thai name if available, fallback to name
        const label = amenity.nameTh || amenity.name;

        return (
          <div
            key={amenity.id}
            onClick={() => toggleAmenity(amenity.id)}
            className={cn(
              "cursor-pointer rounded-xl border p-4 flex items-center justify-between transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/5 text-primary shadow-sm"
                : "border-input hover:border-primary/50 hover:bg-muted/50 text-muted-foreground"
            )}
          >
            <span className="text-sm font-medium">{label}</span>
            {isSelected && <Check className="h-4 w-4" />}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

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

function BasicInfoSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label>ประเภทประกาศ</Label>
          <Controller
            control={control}
            name="listingType"
            render={({ field }) => (
              <NativeSelect
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
          <Label>ประเภทอสังหาฯ</Label>
          <Controller
            control={control}
            name="propertyType"
            render={({ field }) => (
              <NativeSelect
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
        <Label>หัวข้อประกาศ</Label>
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
        <Label>ราคา (บาท)</Label>
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
        <Label>รายละเอียดเพิ่มเติม</Label>
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

function LocationSection() {
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
    setValue("district", "");
    setValue("subDistrict", "");
    setValue("postalCode", "");
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setValue("district", district);
    setValue("subDistrict", "");
    setValue("postalCode", "");
  };

  const handleSubDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subDistrict = e.target.value;
    setValue("subDistrict", subDistrict);

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
        <Label>ที่อยู่ / ชื่อโครงการ *</Label>
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
        <div className="space-y-2">
          <Label>จังหวัด *</Label>
          <div className="relative">
            <select
              className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...(() => {
                const { onChange, ...rest } = register("province");
                return {
                  ...rest,
                  onChange: (e: any) => {
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
          </div>
          {errors.province && (
            <p className="text-xs text-destructive">
              {errors.province.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>เขต/อำเภอ *</Label>
          <div className="relative">
            <select
              className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...(() => {
                const { onChange, ...rest } = register("district");
                return {
                  ...rest,
                  onChange: (e: any) => {
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
          </div>
          {errors.district && (
            <p className="text-xs text-destructive">
              {errors.district.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>แขวง/ตำบล *</Label>
          <div className="relative">
            <select
              className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...(() => {
                const { onChange, ...rest } = register("subDistrict");
                return {
                  ...rest,
                  onChange: (e: any) => {
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
          </div>
          {errors.subDistrict && (
            <p className="text-xs text-destructive">
              {errors.subDistrict.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>รหัสไปรษณีย์</Label>
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

function BedroomsField() {
  const { control } = useFormContext();
  return (
    <div className="space-y-3">
      <Label>ห้องนอน</Label>
      <Controller
        control={control}
        name="bedrooms"
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
  );
}

function BathroomsField() {
  const { control } = useFormContext();
  return (
    <div className="space-y-3">
      <Label>ห้องน้ำ</Label>
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
  );
}

function ParkingField() {
  const { control } = useFormContext();
  return (
    <div className="space-y-3">
      <Label>ที่จอดรถ</Label>
      <Controller
        control={control}
        name="parking"
        render={({ field }) => (
          <NumberSelect
            value={field.value}
            onChange={field.onChange}
            max={10}
            placeholder="-"
            suffix=" คัน"
            className="h-12"
          />
        )}
      />
    </div>
  );
}

function FloorField() {
  const { control } = useFormContext();
  return (
    <div className="space-y-3">
      <Label>ชั้นที่</Label>
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
  );
}

function AreaField() {
  const { control } = useFormContext();
  return (
    <div className="space-y-3">
      <Label>พื้นที่ใช้สอย</Label>
      <Controller
        control={control}
        name="area"
        render={({ field }) => (
          <NumberInput
            value={field.value}
            onValueChange={field.onChange}
            placeholder="ระบุขนาด"
            suffix=" ตร.ม."
            className="h-12"
          />
        )}
      />
    </div>
  );
}

function YearBuiltField() {
  const { control } = useFormContext();
  return (
    <div className="space-y-3">
      <Label>ปีที่สร้างเสร็จ (พ.ศ.)</Label>
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
  );
}

function TotalFloorsField() {
  const { control } = useFormContext();
  return (
    <div className="space-y-3">
      <Label>จำนวนชั้น</Label>
      <Controller
        control={control}
        name="totalFloors"
        render={({ field }) => (
          <NumberSelect
            value={field.value}
            onChange={field.onChange}
            max={10}
            placeholder="-"
            suffix=" ชั้น"
            className="h-12"
          />
        )}
      />
    </div>
  );
}

function LandGroupField() {
  const { control } = useFormContext();
  return (
    <div className="space-y-4 pt-6 border-t border-dashed">
      <h3 className="text-lg font-bold">ขนาดที่ดิน</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-3">
          <Label>ไร่</Label>
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
          <Label>งาน</Label>
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
          <Label>ตารางวา</Label>
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

const FIELDS: Record<string, React.FC<any>> = {
  bedrooms: BedroomsField,
  bathrooms: BathroomsField,
  parking: ParkingField,
  floor: FloorField,
  area: AreaField,
  yearBuilt: YearBuiltField,
  totalFloors: TotalFloorsField,
};

function TypeFieldsSection() {
  const { control } = useFormContext();
  const type = useWatch({ control, name: "propertyType" }) as string;
  const config = PROPERTY_FIELD_CONFIG[type] || PROPERTY_FIELD_CONFIG.house;

  return (
    <div className="space-y-6">
      {config.fields.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {config.fields.map((fieldKey) => {
            const Component = FIELDS[fieldKey];
            if (!Component) return null;
            return <Component key={fieldKey} />;
          })}
        </div>
      )}

      {config.hasLand && <LandGroupField />}
    </div>
  );
}

function MediaSection({ amenities }: { amenities: Amenity[] }) {
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
              amenities={amenities}
            />
          )}
        />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function PostPropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await api.get<{ data: Amenity[] }>("/amenities", {
          params: { activeOnly: true },
        });
        if (response.data && Array.isArray(response.data)) {
          setAmenities(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch amenities:", error);
      }
    };

    fetchAmenities();
  }, []);

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

  interface UploadedFile {
    key: string;
    url: string;
    size: number;
    type: string;
  }

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

  return (
    <div className="container py-16 px-4 md:px-6 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold animate-pulse">
          <Sparkles className="w-4 h-4" />
          สร้างประกาศของคุณให้น่าสนใจ
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          ลงประกาศขาย/เช่า
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          กรอกข้อมูลทรัพย์สินของคุณให้ครบถ้วน ด้วยระบบจัดการที่ง่ายและรวดเร็ว
          เพื่อเพิ่มโอกาสในการเข้าถึงกลุ่มลูกค้าที่ใช่
        </p>
      </div>

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
              <div className="rounded-xl border bg-background/60 backdrop-blur-xl shadow-sm">
                <div className="p-8">
                  <BasicInfoSection />
                </div>
              </div>
            </section>

            {/* 2. Location */}
            <section className="scroll-mt-20">
              <SectionHeader
                id="location"
                icon={MapPin}
                title="ทำเลที่ตั้ง"
                description="ระบุที่ตั้งเพื่อให้ผู้ซื้อค้นหาได้ง่ายขึ้น"
              />
              <div className="rounded-xl border bg-background/60 backdrop-blur-xl shadow-sm">
                <div className="p-8">
                  <LocationSection />
                </div>
              </div>
            </section>

            {/* 3. Details */}
            <section className="scroll-mt-20">
              <SectionHeader
                id="details"
                icon={Home}
                title="รายละเอียดเชิงลึก"
                description="ข้อมูลขนาด พื้นที่ และฟังก์ชั่นการใช้งาน"
              />
              <div className="rounded-xl border bg-background/60 backdrop-blur-xl shadow-sm">
                <div className="p-8">
                  <TypeFieldsSection />
                </div>
              </div>
            </section>

            {/* 4. Media & Amenities */}
            <section className="scroll-mt-20">
              <SectionHeader
                id="media"
                icon={ImageIcon}
                title="รูปภาพและสิ่งอำนวยความสะดวก"
                description="ภาพพรีวิวช่วยในการตัดสินใจได้ดีที่สุด"
              />

              <div className="rounded-xl border bg-background/60 backdrop-blur-xl shadow-sm">
                <div className="p-8">
                  <MediaSection amenities={amenities} />
                </div>
              </div>
            </section>

            {/* Sticky Actions Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 md:px-0">
              <div className="bg-background/80 backdrop-blur-xl border-2 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="p-4 flex items-center justify-between gap-4">
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
                      className="flex-1 md:flex-none h-12 px-12 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all bg-primary text-primary-foreground"
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
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
