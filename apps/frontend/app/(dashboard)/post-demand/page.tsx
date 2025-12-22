"use client";

import { useState, useEffect } from "react";
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
import { MaskInput } from "@/components/ui/mask-input";

// ===== Constants =====
const PROPERTY_TYPES = [
  { value: "condo", label: "คอนโด", icon: Building2 },
  { value: "house", label: "บ้านเดี่ยว", icon: Home },
  { value: "townhouse", label: "ทาวน์เฮาส์", icon: Home },
  { value: "apartment", label: "อพาร์ทเมนต์", icon: Building2 },
  { value: "land", label: "ที่ดิน", icon: MapPin },
  { value: "commercial", label: "อาคารพาณิชย์", icon: Building2 },
];

const URGENCY_OPTIONS: {
  value: DemandUrgency;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "urgent",
    label: "เร่งด่วน",
    description: "ภายใน 1 เดือน",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    value: "normal",
    label: "ปกติ",
    description: "2-3 เดือน",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    value: "not_rush",
    label: "ไม่รีบ",
    description: "ยังไม่กำหนด",
    icon: <Search className="h-5 w-5" />,
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
    return `฿${Number(min).toLocaleString()} - ฿${Number(max).toLocaleString()}${suffix}`;
  }
  if (min) return `ตั้งแต่ ฿${Number(min).toLocaleString()}${suffix}`;
  if (max) return `ไม่เกิน ฿${Number(max).toLocaleString()}${suffix}`;
  return "ไม่ระบุงบประมาณ";
};

const getStatusBadge = (status: DemandStatus) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500">กำลังหา</Badge>;
    case "matched":
      return <Badge className="bg-blue-500">เจอแล้ว</Badge>;
    case "closed":
      return <Badge variant="secondary">ปิดแล้ว</Badge>;
    case "expired":
      return <Badge variant="outline">หมดอายุ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getUrgencyBadge = (urgency: DemandUrgency) => {
  switch (urgency) {
    case "urgent":
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          <Zap className="mr-1 h-3 w-3" />
          เร่งด่วน
        </Badge>
      );
    case "normal":
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          <Clock className="mr-1 h-3 w-3" />
          ปกติ
        </Badge>
      );
    case "not_rush":
      return (
        <Badge variant="outline">
          <Search className="mr-1 h-3 w-3" />
          ไม่รีบ
        </Badge>
      );
    default:
      return null;
  }
};

const getPropertyTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    condo: "คอนโด",
    house: "บ้านเดี่ยว",
    townhouse: "ทาวน์เฮาส์",
    apartment: "อพาร์ทเมนต์",
    land: "ที่ดิน",
    commercial: "อาคารพาณิชย์",
  };
  return labels[type] || type;
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">ประกาศหาอสังหาริมทรัพย์</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              บอกเราว่าคุณกำลังมองหาอสังหาแบบไหน
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">คุณต้องการ</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateForm("intent", "buy")}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                        formData.intent === "buy"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      <Home className="h-6 w-6 text-primary" />
                      <span className="font-medium">ซื้อ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm("intent", "rent")}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                        formData.intent === "rent"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      <Building2 className="h-6 w-6 text-primary" />
                      <span className="font-medium">เช่า</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ประเภทอสังหา</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {PROPERTY_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateForm("propertyType", type.value)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border-2 p-3 text-sm transition-all",
                            formData.propertyType === type.value
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/50"
                          )}
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          <span>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    งบประมาณ{" "}
                    {formData.intent === "rent" ? "(บาท/เดือน)" : "(บาท)"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <MaskInput
                      type="number"
                      placeholder="ต่ำสุด"
                      onValueChange={(value) =>
                        updateForm(
                          "budgetMin",
                          value ? Number(value) : undefined
                        )
                      }
                    />
                    <MaskInput
                      type="number"
                      placeholder="สูงสุด"
                      onValueChange={(value) =>
                        updateForm(
                          "budgetMax",
                          value ? Number(value) : undefined
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ทำเล</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="จังหวัด"
                      value={formData.province || ""}
                      onChange={(e) => updateForm("province", e.target.value)}
                    />
                    <Input
                      placeholder="เขต/อำเภอ"
                      value={formData.district || ""}
                      onChange={(e) => updateForm("district", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ความต้องการห้อง</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        ห้องนอน
                      </label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={formData.bedroomsMin || ""}
                        onChange={(e) =>
                          updateForm(
                            "bedroomsMin",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        ห้องน้ำ
                      </label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={formData.bathroomsMin || ""}
                        onChange={(e) =>
                          updateForm(
                            "bathroomsMin",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        พื้นที่ (ตร.ม.)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={formData.areaMin || ""}
                        onChange={(e) =>
                          updateForm(
                            "areaMin",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ความเร่งด่วน</label>
                  <div className="grid grid-cols-3 gap-2">
                    {URGENCY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateForm("urgency", option.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all",
                          formData.urgency === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50"
                        )}
                      >
                        {option.icon}
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">สิ่งที่ต้องการ</label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map((tag) => (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => toggleTag(tag.value)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm transition-all",
                          formData.tags?.includes(tag.value)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted hover:border-primary"
                        )}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    รายละเอียดเพิ่มเติม
                  </label>
                  <Textarea
                    placeholder="บอกรายละเอียดเพิ่มเติม..."
                    rows={3}
                    value={formData.description || ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      updateForm("description", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t pt-4">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                ย้อนกลับ
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleClose}>
                ยกเลิก
              </Button>
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                ถัดไป
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังลงประกาศ...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    ลงประกาศ
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
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
      // For now, get user's demands. In a real app, this would fetch all public demands
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

  // Filter demands
  const filteredDemands = demands.filter((demand) => {
    if (filterIntent && demand.intent !== filterIntent) return false;
    if (filterPropertyType && demand.propertyType !== filterPropertyType)
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">ประกาศหาอสังหาริมทรัพย์</h1>
            <p className="mt-1 text-muted-foreground">
              ค้นหาผู้ที่กำลังมองหาอสังหาริมทรัพย์ หรือลงประกาศความต้องการของคุณ
            </p>
          </div>
          <Button onClick={handleCreateClick} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            ลงประกาศหาอสังหา
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={filterIntent}
            onChange={(e) => setFilterIntent(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">ทุกประเภท (ซื้อ/เช่า)</option>
            <option value="buy">ต้องการซื้อ</option>
            <option value="rent">ต้องการเช่า</option>
          </select>

          <select
            value={filterPropertyType}
            onChange={(e) => setFilterPropertyType(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">ทุกประเภทอสังหา</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="mb-3 h-6 w-24" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg bg-destructive/10 p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={fetchDemands}
            >
              ลองใหม่
            </Button>
          </div>
        ) : !session?.user ? (
          <Card>
            <CardContent className="py-16 text-center">
              <User className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">กรุณาเข้าสู่ระบบ</h2>
              <p className="mt-2 text-muted-foreground">
                เข้าสู่ระบบเพื่อดูและลงประกาศหาอสังหา
              </p>
              <Link href="/sign-in?redirect=/post-demand">
                <Button className="mt-4">เข้าสู่ระบบ</Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredDemands.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Search className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">
                ยังไม่มีประกาศหาอสังหา
              </h2>
              <p className="mt-2 text-muted-foreground">
                เริ่มต้นลงประกาศความต้องการหาอสังหาริมทรัพย์ของคุณ
              </p>
              <Button className="mt-4" onClick={handleCreateClick}>
                <Plus className="mr-2 h-4 w-4" />
                ลงประกาศหาอสังหา
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDemands.map((demand, index) => (
              <motion.div
                key={demand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {getStatusBadge(demand.status)}
                      {getUrgencyBadge(demand.urgency)}
                    </div>

                    {/* Title */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {demand.intent === "buy"
                            ? "ต้องการซื้อ"
                            : "ต้องการเช่า"}
                        </Badge>
                        <Badge variant="secondary">
                          {getPropertyTypeLabel(demand.propertyType)}
                        </Badge>
                      </div>
                    </div>

                    {/* Budget */}
                    <p className="mb-2 text-lg font-semibold text-primary">
                      {formatBudget(
                        demand.budgetMin,
                        demand.budgetMax,
                        demand.intent
                      )}
                    </p>

                    {/* Location */}
                    {(demand.province || demand.district) && (
                      <p className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {[demand.district, demand.province]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}

                    {/* Requirements */}
                    <div className="mb-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {demand.bedroomsMin && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          {demand.bedroomsMin}+ ห้องนอน
                        </span>
                      )}
                      {demand.bathroomsMin && (
                        <span className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          {demand.bathroomsMin}+ ห้องน้ำ
                        </span>
                      )}
                      {demand.areaMin && (
                        <span className="flex items-center gap-1">
                          <Ruler className="h-3 w-3" />
                          {demand.areaMin}+ ตร.ม.
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {demand.tags && demand.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {demand.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {demand.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{demand.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(demand.createdAt)}
                      </span>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="mr-1 h-3 w-3" />
                        ติดต่อ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Create Demand Modal */}
      <CreateDemandModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
