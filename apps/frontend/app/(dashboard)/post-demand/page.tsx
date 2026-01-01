"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Home,
  Building2,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Loader2,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Plus,
  X,
  Filter,
  ArrowLeft,
  ArrowRight,
  User,
  Calendar,
  MessageCircle,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

import { Navbar, Footer } from "@/components/layout";
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
  Skeleton,
  Textarea,
} from "@/components/ui";
import {
  demandsService,
  type Demand,
  type CreateDemandInput,
  type DemandIntent,
  type DemandUrgency,
  type DemandStatus,
} from "@/services";
import { useSession } from "@/services";
import { toast } from "sonner";
import { cn } from "@/lib";
import { NumericFormat } from "react-number-format";
import { thaiAddressData, provinces } from "@/data/thai-address";

// ===== Constants =====
const PROPERTY_TYPES = [
  {
    value: "condo",
    label: "คอนโด",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    value: "house",
    label: "บ้านเดี่ยว",
    icon: Home,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    value: "townhouse",
    label: "ทาวน์เฮาส์",
    icon: Home,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    value: "apartment",
    label: "อพาร์ทเมนต์",
    icon: Building2,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    value: "land",
    label: "ที่ดิน",
    icon: MapPin,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    value: "commercial",
    label: "อาคารพาณิชย์",
    icon: Building2,
    color: "bg-rose-500/10 text-rose-600",
  },
];

const URGENCY_OPTIONS: {
  value: DemandUrgency;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "urgent",
    label: "เร่งด่วน",
    description: "ภายใน 1 เดือน",
    icon: <Zap className="h-5 w-5" />,
    color: "from-orange-500 to-rose-500",
  },
  {
    value: "normal",
    label: "ปกติ",
    description: "2-3 เดือน",
    icon: <Clock className="h-5 w-5" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    value: "not_rush",
    label: "ไม่รีบ",
    description: "ยังไม่กำหนด",
    icon: <Search className="h-5 w-5" />,
    color: "from-zinc-500 to-slate-500",
  },
];

const POPULAR_TAGS = [
  { value: "pet-friendly", label: "เลี้ยงสัตว์ได้" },
  { value: "furnished", label: "เฟอร์นิเจอร์ครบ" },
  { value: "near-bts", label: "ใกล้ BTS" },
  { value: "near-mrt", label: "ใกล้ MRT" },
  { value: "parking", label: "มีที่จอดรถ" },
  { value: "pool", label: "มีสระว่ายน้ำ" },
  { value: "gym", label: "มีฟิตเนส" },
  { value: "security-24h", label: "รปภ. 24 ชม." },
];

// ===== Helpers =====
const formatBudget = (
  min?: string | null,
  max?: string | null,
  intent?: string
) => {
  const suffix = intent === "rent" ? "/เดือน" : "";
  if (min && max) {
    if (Number(min) === 0)
      return `ไม่เกิน ฿${Number(max).toLocaleString()}${suffix}`;
    return `฿${Number(min).toLocaleString()} - ฿${Number(max).toLocaleString()}${suffix}`;
  }
  if (min) return `ตั้งแต่ ฿${Number(min).toLocaleString()}${suffix}`;
  if (max) return `ไม่เกิน ฿${Number(max).toLocaleString()}${suffix}`;
  return "ไม่ระบุงบประมาณ";
};

const getStatusBadge = (status: DemandStatus) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-3 font-black text-[10px] uppercase tracking-wider">
          Active
        </Badge>
      );
    case "matched":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 border-none px-3 font-black text-[10px] uppercase tracking-wider">
          Matched
        </Badge>
      );
    case "closed":
      return (
        <Badge
          variant="secondary"
          className="px-3 font-black text-[10px] uppercase tracking-wider"
        >
          Closed
        </Badge>
      );
    case "expired":
      return (
        <Badge
          variant="outline"
          className="px-3 font-black text-[10px] uppercase tracking-wider"
        >
          Expired
        </Badge>
      );
    default:
      return (
        <Badge
          variant="secondary"
          className="px-3 font-black text-[10px] uppercase tracking-wider"
        >
          {status}
        </Badge>
      );
  }
};

const getUrgencyBadge = (urgency: DemandUrgency) => {
  const option = URGENCY_OPTIONS.find((o) => o.value === urgency);
  if (!option) return null;

  return (
    <Badge
      variant="outline"
      className="border-border/40 bg-zinc-100 dark:bg-zinc-800 text-foreground font-bold text-[10px] px-3"
    >
      {option.icon && (
        <span className="mr-1 h-3 w-3 inline-block">{option.icon}</span>
      )}
      {option.label}
    </Badge>
  );
};

const getPropertyTypeLabel = (type: string) => {
  const match = PROPERTY_TYPES.find((p) => p.value === type);
  return match?.label || type;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ===== Create Demand Modal Component =====
function CreateDemandModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateDemandInput>({
    intent: "buy",
    propertyType: "",
    urgency: "normal",
    isPublic: true,
  });

  const updateForm = (field: keyof CreateDemandInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag: string) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tag)) {
      updateForm(
        "tags",
        currentTags.filter((t) => t !== tag)
      );
    } else {
      if (currentTags.length < 10) {
        updateForm("tags", [...currentTags, tag]);
      }
    }
  };

  const handleProvinceChange = (province: string) => {
    setFormData((prev) => ({
      ...prev,
      province,
      district: "",
      subDistrict: "",
    }));
  };

  const handleDistrictChange = (district: string) => {
    setFormData((prev) => ({
      ...prev,
      district,
      subDistrict: "",
    }));
  };

  const districtsMap = formData.province
    ? thaiAddressData[formData.province]?.districts || {}
    : {};
  const districts = Object.keys(districtsMap);

  const subDistricts =
    formData.province && formData.district && districtsMap[formData.district]
      ? districtsMap[formData.district].subDistricts
      : [];

  const handleSubmit = async () => {
    if (!formData.propertyType) {
      toast.error("กรุณาเลือกประเภทอสังหาริมทรัพย์");
      return;
    }

    setIsSubmitting(true);
    try {
      await demandsService.create(formData);
      toast.success("ลงประกาศหาอสังหาสำเร็จ!");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Failed to create demand:", error);
      toast.error("ไม่สามารถลงประกาศได้ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      intent: "buy",
      propertyType: "",
      urgency: "normal",
      isPublic: true,
    });
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.intent && formData.propertyType;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="fixed left-1/2 top-1/2 z-60 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[40px] shadow-2xl overflow-hidden border border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Glass Top Bar */}
            <div className="p-6 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">
                    Post <span className="text-primary italic">Demand</span>
                  </h2>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="px-8 pt-8">
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex-1 flex flex-col gap-2">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        step >= s
                          ? "bg-primary"
                          : "bg-zinc-100 dark:bg-zinc-900"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        step >= s ? "text-primary" : "text-muted-foreground/40"
                      )}
                    >
                      Step {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Area with Animation Wrapper */}
            <div className="p-8 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {step === 1 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Zap className="h-3 w-3 text-primary" />
                          คุณต้องการจะทำอะไร?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              id: "buy",
                              label: "ซื้อ",
                              sub: "I want to buy",
                              icon: Home,
                            },
                            {
                              id: "rent",
                              label: "เช่า",
                              sub: "I am looking for rent",
                              icon: Building2,
                            },
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => updateForm("intent", item.id)}
                              className={cn(
                                "group relative flex flex-col items-start gap-4 p-6 rounded-[32px] border-2 transition-all text-left",
                                formData.intent === item.id
                                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                                  : "border-zinc-100 dark:border-zinc-900 hover:border-primary/40 bg-zinc-50/50 dark:bg-zinc-900/50"
                              )}
                            >
                              {formData.intent === item.id && (
                                <motion.div
                                  layoutId="step1_intent"
                                  className="absolute top-4 right-4 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </motion.div>
                              )}
                              <div
                                className={cn(
                                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                                  formData.intent === item.id
                                    ? "bg-primary text-white"
                                    : "bg-white dark:bg-zinc-800 text-muted-foreground"
                                )}
                              >
                                <item.icon className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
                                  {item.sub}
                                </p>
                                <p className="text-2xl font-black">
                                  {item.label}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <LayoutGrid className="h-3 w-3 text-primary" />
                          ประเภทอสังหาที่คุณมองหา
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {PROPERTY_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isSelected =
                              formData.propertyType === type.value;
                            return (
                              <button
                                key={type.value}
                                onClick={() =>
                                  updateForm("propertyType", type.value)
                                }
                                className={cn(
                                  "flex items-center gap-3 p-4 rounded-2xl border transition-all text-sm font-bold",
                                  isSelected
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border/40 hover:border-primary/20"
                                )}
                              >
                                <div
                                  className={cn(
                                    "p-2 rounded-lg",
                                    isSelected
                                      ? "bg-primary text-white"
                                      : "bg-zinc-100 dark:bg-zinc-900 text-muted-foreground",
                                    type.color
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="line-clamp-1">
                                  {type.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                          งบประมาณ{" "}
                          {formData.intent === "rent" ? "(บาท/เดือน)" : "(บาท)"}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-4">
                              Min Price
                            </span>
                            <NumericFormat
                              placeholder="ต่ำสุด"
                              allowNegative={false}
                              thousandSeparator
                              className="h-14 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-none shadow-none px-6 font-black focus:outline-none focus:ring-2 focus:ring-primary"
                              onValueChange={(values) =>
                                updateForm("budgetMin", values.floatValue)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-4">
                              Max Price
                            </span>
                            <NumericFormat
                              placeholder="สูงสุด"
                              allowNegative={false}
                              thousandSeparator
                              className="h-14 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-none shadow-none px-6 font-black focus:outline-none focus:ring-2 focus:ring-primary"
                              onValueChange={(values) =>
                                updateForm("budgetMax", values.floatValue)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                          ทำเลเป้าหมาย
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-4">
                              Province
                            </span>
                            <select
                              className="h-14 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-none px-6 font-black text-sm appearance-none outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                              value={formData.province || ""}
                              onChange={(e) =>
                                handleProvinceChange(e.target.value)
                              }
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

                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-4">
                              District
                            </span>
                            <select
                              className="h-14 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-none px-6 font-black text-sm appearance-none outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer disabled:opacity-50"
                              value={formData.district || ""}
                              onChange={(e) =>
                                handleDistrictChange(e.target.value)
                              }
                              disabled={!formData.province}
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

                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-4">
                              Sub-district
                            </span>
                            <select
                              className="h-14 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-none px-6 font-black text-sm appearance-none outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer disabled:opacity-50"
                              value={formData.subDistrict || ""}
                              onChange={(e) =>
                                updateForm("subDistrict", e.target.value)
                              }
                              disabled={!formData.district}
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
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                          ความต้องการห้องขั้นต่ำ
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-center text-muted-foreground uppercase">
                              Beds
                            </span>
                            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-1">
                              <button
                                onClick={() =>
                                  updateForm(
                                    "bedroomsMin",
                                    Math.max(0, (formData.bedroomsMin || 0) - 1)
                                  )
                                }
                                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white transition-all text-muted-foreground"
                              >
                                -
                              </button>
                              <span className="flex-1 text-center font-black">
                                {formData.bedroomsMin || 0}
                              </span>
                              <button
                                onClick={() =>
                                  updateForm(
                                    "bedroomsMin",
                                    (formData.bedroomsMin || 0) + 1
                                  )
                                }
                                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white transition-all text-muted-foreground"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-center text-muted-foreground uppercase">
                              Baths
                            </span>
                            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-1">
                              <button
                                onClick={() =>
                                  updateForm(
                                    "bathroomsMin",
                                    Math.max(
                                      0,
                                      (formData.bathroomsMin || 0) - 1
                                    )
                                  )
                                }
                                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white transition-all text-muted-foreground"
                              >
                                -
                              </button>
                              <span className="flex-1 text-center font-black">
                                {formData.bathroomsMin || 0}
                              </span>
                              <button
                                onClick={() =>
                                  updateForm(
                                    "bathroomsMin",
                                    (formData.bathroomsMin || 0) + 1
                                  )
                                }
                                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white transition-all text-muted-foreground"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-center text-muted-foreground uppercase">
                              Sq.m
                            </span>
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-none text-center font-black shadow-none"
                              value={formData.areaMin || ""}
                              onChange={(e) =>
                                updateForm(
                                  "areaMin",
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Zap className="h-3 w-3 text-primary" />
                          คุณเร่งด่วนแค่ไหน?
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {URGENCY_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                updateForm("urgency", option.value)
                              }
                              className={cn(
                                "flex flex-col items-center gap-2 p-5 rounded-[32px] border-2 transition-all",
                                formData.urgency === option.value
                                  ? `border-primary bg-primary/5 text-primary`
                                  : "border-zinc-100 dark:border-zinc-900 hover:border-primary/40 bg-zinc-50 dark:bg-zinc-900/50"
                              )}
                            >
                              <div
                                className={cn(
                                  "h-10 w-10 rounded-full flex items-center justify-center",
                                  formData.urgency === option.value
                                    ? "bg-primary text-white"
                                    : "bg-white dark:bg-zinc-800 text-muted-foreground"
                                )}
                              >
                                {option.icon}
                              </div>
                              <span className="text-xs font-black uppercase tracking-widest">
                                {option.label}
                              </span>
                              <span className="text-[10px] opacity-60 font-medium">
                                {option.description}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                          สิ่งที่ต้องมีเพิ่มเติม
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {POPULAR_TAGS.map((tag) => (
                            <button
                              key={tag.value}
                              onClick={() => toggleTag(tag.value)}
                              className={cn(
                                "rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest border transition-all",
                                formData.tags?.includes(tag.value)
                                  ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-lg"
                                  : "border-border/40 hover:border-primary text-muted-foreground hover:text-primary"
                              )}
                            >
                              {tag.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                          รายละเอียดอื่นๆ ที่คุณต้องการระบุ
                        </label>
                        <Textarea
                          placeholder="เช่น ติดรถไฟฟ้า, มีระเบียงกว้าง, ชั้นสูง..."
                          rows={4}
                          className="rounded-[32px] bg-zinc-100 dark:bg-zinc-900 border-none p-6 text-sm font-medium focus:ring-2 focus:ring-primary shadow-none"
                          value={formData.description || ""}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => updateForm("description", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-8 border-t border-border/40 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  className="rounded-full h-12 px-8 font-black uppercase tracking-widest text-xs"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  ย้อนกลับ
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="rounded-full h-12 px-8 font-black uppercase tracking-widest text-xs"
                >
                  ยกเลิก
                </Button>
              )}

              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="rounded-full h-14 px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                >
                  ถัดไป
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-full h-14 px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังเซฟ...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      เปิดประกาศ
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ===== Main Page Component =====
export default function DemandsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  const [demands, setDemands] = useState<Demand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterIntent, setFilterIntent] = useState<string>("");
  const [filterPropertyType, setFilterPropertyType] = useState<string>("");

  const fetchDemands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await demandsService.getMine();
      setDemands(data || []);
    } catch (err) {
      console.error("Failed to fetch demands:", err);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchDemands();
    } else if (!isSessionLoading) {
      setIsLoading(false);
    }
  }, [session, isSessionLoading]);

  const handleCreateClick = () => {
    if (!session?.user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนลงประกาศ");
      router.push("/sign-in?redirect=/post-demand");
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    fetchDemands();
  };

  const filteredDemands = demands.filter((demand) => {
    if (filterIntent && demand.intent !== filterIntent) return false;
    if (filterPropertyType && demand.propertyType !== filterPropertyType)
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black">
      <main className="container mx-auto px-4 py-16">
        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Badge className="bg-primary/10 text-primary mb-3 rounded-full font-black border-none uppercase tracking-widest text-[10px] px-3 py-1">
              Find Your Match
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight flex flex-wrap items-center gap-4">
              POST <span className="text-primary italic">DEMANDS</span>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </h1>
            <p className="mt-4 text-muted-foreground font-medium text-lg max-w-xl">
              บอกความต้องการของคุณให้เรารู้ ระบบ AI ของเราจะช่วยจับคู่กับอสังหาฯ
              ที่ตรงใจคุณที่สุดโดยอัตโนมัติ
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={handleCreateClick}
              className="h-16 px-10 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 gap-3 group transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              Create New Demand
            </Button>
          </motion.div>
        </div>

        {/* Filters Sticky Bar */}
        <div className="mb-12 sticky top-24 z-30">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex flex-wrap gap-3 p-3 rounded-[32px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border/40 shadow-xl"
          >
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 border border-border/40 shadow-sm">
              <button
                onClick={() => setFilterIntent("")}
                className={cn(
                  "p-2 px-4 rounded-full transition-all text-[10px] font-black uppercase tracking-widest",
                  filterIntent === ""
                    ? "bg-white dark:bg-zinc-900 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ALL
              </button>
              <button
                onClick={() => setFilterIntent("buy")}
                className={cn(
                  "p-2 px-4 rounded-full transition-all text-[10px] font-black uppercase tracking-widest",
                  filterIntent === "buy"
                    ? "bg-white dark:bg-zinc-900 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                BUY
              </button>
              <button
                onClick={() => setFilterIntent("rent")}
                className={cn(
                  "p-2 px-4 rounded-full transition-all text-[10px] font-black uppercase tracking-widest",
                  filterIntent === "rent"
                    ? "bg-white dark:bg-zinc-900 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                RENT
              </button>
            </div>

            <select
              value={filterPropertyType}
              onChange={(e) => setFilterPropertyType(e.target.value)}
              className="rounded-full border border-border/40 bg-zinc-100 dark:bg-zinc-800 px-6 font-black text-[10px] uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
            >
              <option value="">PROPERTY TYPE</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label.toUpperCase()}
                </option>
              ))}
            </select>

            {(filterIntent || filterPropertyType) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterIntent("");
                  setFilterPropertyType("");
                }}
                className="h-10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
              >
                Reset
              </Button>
            )}
          </motion.div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-[400px] rounded-[40px] border border-border/40"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[40px] bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-12 text-center">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
              <X className="h-8 w-8" />
            </div>
            <p className="text-xl font-black mb-4">{error}</p>
            <Button
              variant="outline"
              className="rounded-full px-8"
              onClick={fetchDemands}
            >
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        ) : !session?.user ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="rounded-[50px] border border-border/40 overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
              <CardContent className="py-24 text-center">
                <div className="h-24 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 border border-muted/50">
                  <User className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tight mb-4 italic text-zinc-900 dark:text-white">
                  Join the <span className="text-primary italic">Estates</span>
                </h2>
                <p className="text-muted-foreground font-medium text-lg mb-10 max-w-sm mx-auto">
                  กรุณาเข้าสู่ระบบเพื่อจัดการและติดตามสถานะความต้องการอหาอสังหาริมทรัพย์ของคุณ
                </p>
                <Link href="/sign-in?redirect=/post-demand">
                  <Button className="h-14 px-12 rounded-full font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
                    Sign In Now
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : filteredDemands.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-[50px] border-none bg-zinc-100 dark:bg-zinc-900/50">
              <CardContent className="py-24 text-center">
                <div className="h-24 w-24 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 border border-muted/50 text-muted-foreground/20">
                  <Search className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-3">
                  No Demands <span className="text-primary">Yet</span>
                </h2>
                <p className="text-muted-foreground font-medium text-lg mb-10">
                  คุณยังไม่ได้ลงประกาศความต้องการหาอสังหาฯ เลย
                </p>
                <Button
                  className="h-14 px-12 rounded-full font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                  onClick={handleCreateClick}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDemands.map((demand, index) => (
              <motion.div
                key={demand.id || `demand-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 6) * 0.05 }}
              >
                <Card className="group h-full bg-white dark:bg-zinc-900 rounded-[40px] overflow-hidden border border-border/40 hover:border-primary/40 transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col">
                  {/* Card Main Image/Gradient Background */}
                  <div className="h-32 bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 p-8 flex items-end justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-2xl -z-1" />
                    <div className="flex gap-2 relative z-10">
                      {getStatusBadge(demand.status)}
                      {getUrgencyBadge(demand.urgency)}
                    </div>
                    <Badge className="bg-white/80 dark:bg-black/40 backdrop-blur-md text-foreground border-none font-black text-[9px] uppercase tracking-widest px-3">
                      Ref: {demand.id.slice(0, 8)}
                    </Badge>
                  </div>

                  <CardContent className="flex-1 p-8 flex flex-col">
                    <div className="mb-6 flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="h-8 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-tighter text-[10px]"
                      >
                        FOR {demand.intent.toUpperCase()}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="h-8 rounded-full border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-foreground font-black uppercase tracking-tighter text-[10px]"
                      >
                        {getPropertyTypeLabel(demand.propertyType)}
                      </Badge>
                    </div>

                    <h3 className="text-2xl font-black line-clamp-2 leading-tight group-hover:text-primary transition-colors mb-4">
                      {demand.description ||
                        `ความต้องการหา${getPropertyTypeLabel(demand.propertyType)}ที่สอดคล้องกับคุณ`}
                    </h3>

                    <p className="text-3xl font-black text-primary mb-6">
                      {formatBudget(
                        demand.budgetMin,
                        demand.budgetMax,
                        demand.intent
                      )}
                    </p>

                    <div className="space-y-4 mb-8">
                      {(demand.province ||
                        demand.district ||
                        demand.subDistrict) && (
                        <div className="flex items-center gap-3 text-muted-foreground font-bold text-sm">
                          <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                            <MapPin className="h-4 w-4" />
                          </div>
                          {[
                            demand.subDistrict,
                            demand.district,
                            demand.province,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            val: demand.bedroomsMin,
                            icon: <Bed className="h-3.5 w-3.5" />,
                            label: "Beds",
                          },
                          {
                            val: demand.bathroomsMin,
                            icon: <Bath className="h-3.5 w-3.5" />,
                            label: "Baths",
                          },
                          {
                            val: demand.areaMin,
                            icon: <Ruler className="h-3.5 w-3.5" />,
                            label: "Sq.m",
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3 flex flex-col items-center gap-1 border border-border/10"
                          >
                            <span className="text-muted-foreground/40">
                              {item.icon}
                            </span>
                            <span className="text-sm font-black">
                              {item.val || "-"}
                            </span>
                            <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/30">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {demand.tags && demand.tags.length > 0 && (
                      <div className="mb-8 flex flex-wrap gap-1.5">
                        {demand.tags
                          .filter((tag) => !!tag)
                          .map((tag, i) => (
                            <span
                              key={`${tag}-${i}`}
                              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground/40 font-black text-[10px] uppercase tracking-widest">
                        <Calendar className="h-3 w-3" />
                        {formatDate(demand.createdAt)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          className="h-10 w-10 p-0 rounded-full hover:bg-primary/5 hover:text-primary transition-all"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-10 px-5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* High-end Create Demand Modal */}
      <CreateDemandModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
