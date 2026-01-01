"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Home,
  Building2,
  Clock,
  Zap,
  MapPin,
  Trash2,
  Edit,
  XCircle,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

import { Navbar, Footer } from "@/components/layout";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Spinner,
  Skeleton,
} from "@/components/ui";
import {
  demandsService,
  type Demand,
  type DemandStats,
  type DemandStatus,
  type DemandUrgency,
} from "@/services";
import { useSession } from "@/services";
import { toast } from "sonner";
import { cn } from "@/lib";

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
  return "ไม่ระบุ";
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

const getUrgencyIcon = (urgency: DemandUrgency) => {
  switch (urgency) {
    case "urgent":
      return <Zap className="h-4 w-4 text-orange-500" />;
    case "normal":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "not_rush":
      return <Search className="h-4 w-4 text-muted-foreground" />;
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

export default function MyDemandsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  const [demands, setDemands] = useState<Demand[]>([]);
  const [stats, setStats] = useState<DemandStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;

      setIsLoading(true);
      setError(null);
      try {
        const [demandsData, statsData] = await Promise.all([
          demandsService.getMine(),
          demandsService.getMyStats(),
        ]);
        setDemands(demandsData || []);
        setStats(statsData || null);
      } catch (err) {
        console.error("Failed to fetch demands:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    } else if (!isSessionLoading) {
      setIsLoading(false);
    }
  }, [session, isSessionLoading]);

  const handleClose = async (id: string) => {
    setClosingId(id);
    try {
      await demandsService.close(id);
      setDemands((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: "closed" as DemandStatus } : d
        )
      );
      if (stats) {
        setStats({
          ...stats,
          active: stats.active - 1,
          closed: stats.closed + 1,
        });
      }
      toast.success("ปิดประกาศแล้ว");
    } catch (err) {
      console.error("Failed to close demand:", err);
      toast.error("ไม่สามารถปิดประกาศได้");
    } finally {
      setClosingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบประกาศนี้หรือไม่?")) return;

    setDeletingId(id);
    try {
      await demandsService.delete(id);
      setDemands((prev) => prev.filter((d) => d.id !== id));
      if (stats) {
        const demand = demands.find((d) => d.id === id);
        if (demand?.status === "active") {
          setStats({
            ...stats,
            active: stats.active - 1,
            total: stats.total - 1,
          });
        }
      }
      toast.success("ลบประกาศแล้ว");
    } catch (err) {
      console.error("Failed to delete demand:", err);
      toast.error("ไม่สามารถลบประกาศได้");
    } finally {
      setDeletingId(null);
    }
  };

  if (isSessionLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="mt-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">กรุณาเข้าสู่ระบบ</h1>
          <p className="mt-2 text-muted-foreground">
            คุณต้องเข้าสู่ระบบก่อนจึงจะดูประกาศหาอสังหาได้
          </p>
          <Link href="/sign-in?redirect=/my-demands">
            <Button className="mt-4">เข้าสู่ระบบ</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">ประกาศหาอสังหาของฉัน</h1>
            <p className="mt-1 text-muted-foreground">
              จัดการประกาศความต้องการหาอสังหาริมทรัพย์
            </p>
          </div>
          <Link href="/post-demand">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              ลงประกาศใหม่
            </Button>
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ทั้งหมด</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">กำลังหา</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.active}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">เจอแล้ว</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.matched}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">สล็อตเหลือ</p>
                    <p className="text-2xl font-bold">{stats.remainingSlots}</p>
                  </div>
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              ลองใหม่
            </Button>
          </div>
        )}

        {/* Demands List */}
        {demands.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Search className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">
                ยังไม่มีประกาศหาอสังหา
              </h2>
              <p className="mt-2 text-muted-foreground">
                เริ่มต้นโพสต์ความต้องการหาอสังหาริมทรัพย์ของคุณ
              </p>
              <Link href="/post-demand">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  ลงประกาศหาอสังหา
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {demands.map((demand, index) => (
              <motion.div
                key={demand.id || `my-demand-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(demand.status)}
                          {getUrgencyIcon(demand.urgency)}
                          <Badge variant="outline">
                            {demand.intent === "buy" ? "ซื้อ" : "เช่า"}
                          </Badge>
                          <Badge variant="outline">
                            {getPropertyTypeLabel(demand.propertyType)}
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-1">
                          <p className="font-semibold">
                            งบประมาณ:{" "}
                            {formatBudget(
                              demand.budgetMin,
                              demand.budgetMax,
                              demand.intent
                            )}
                          </p>
                          {(demand.province || demand.district) && (
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {[demand.district, demand.province]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                          {demand.bedroomsMin && (
                            <p className="text-sm text-muted-foreground">
                              ห้องนอน: {demand.bedroomsMin}+ ห้อง
                            </p>
                          )}
                        </div>

                        {demand.summary && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {demand.summary}
                          </p>
                        )}

                        {demand.tags && demand.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {demand.tags
                              .filter((tag) => !!tag)
                              .map((tag, i) => (
                                <Badge
                                  key={`${tag}-${i}`}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        )}

                        <p className="mt-3 text-xs text-muted-foreground">
                          สร้างเมื่อ {formatDate(demand.createdAt)}
                          {demand.expiresAt &&
                            ` • หมดอายุ ${formatDate(demand.expiresAt)}`}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 sm:flex-col">
                        {demand.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClose(demand.id)}
                            disabled={closingId === demand.id}
                          >
                            {closingId === demand.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="mr-1 h-4 w-4" />
                                ปิดประกาศ
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(demand.id)}
                          disabled={deletingId === demand.id}
                        >
                          {deletingId === demand.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="mr-1 h-4 w-4" />
                              ลบ
                            </>
                          )}
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
    </div>
  );
}
