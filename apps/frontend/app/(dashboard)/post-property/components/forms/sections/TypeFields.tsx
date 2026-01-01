"use client";

import { useFormContext, useWatch, Controller } from "react-hook-form";
import { NumberInput, NumberSelect } from "../ui";
import { ReactNode } from "react";

// 1. Configuration
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

// 2. Field Components Dictionary
const FIELDS: Record<string, React.FC<any>> = {
  bedrooms: BedroomsField,
  bathrooms: BathroomsField,
  parking: ParkingField,
  floor: FloorField,
  area: AreaField,
  yearBuilt: YearBuiltField,
  totalFloors: TotalFloorsField,
};

// 3. Main Component
export function TypeFields() {
  const { control } = useFormContext();
  const type = useWatch({ control, name: "propertyType" }) as string;

  const config = PROPERTY_FIELD_CONFIG[type] || PROPERTY_FIELD_CONFIG.house;

  return (
    <div className="space-y-6">
      {config.fields.length > 0 && (
        <FieldGrid>
          {config.fields.map((fieldKey) => {
            const Component = FIELDS[fieldKey];
            if (!Component) return null;
            return <Component key={fieldKey} />;
          })}
        </FieldGrid>
      )}

      {config.hasLand && <LandGroupField />}
    </div>
  );
}

// 4. Layout Component
function FieldGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{children}</div>
  );
}

// -----------------------------------------------------------------------------
// Reusable Atomic Fields
// -----------------------------------------------------------------------------

function BedroomsField() {
  const { control } = useFormContext();
  return (
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
  );
}

function ParkingField() {
  const { control } = useFormContext();
  return (
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
  );
}

function TotalFloorsField() {
  const { control } = useFormContext();
  return (
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

function AreaField() {
  const { control } = useFormContext();
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-muted-foreground">
        พื้นที่ใช้สอย
      </label>
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
  );
}

function LandGroupField() {
  const { control } = useFormContext();
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
