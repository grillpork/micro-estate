"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  DollarSign,
  Plus,
  ArrowRight,
  BarChart3,
  Home,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Navbar, Footer } from "@/components/layout";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Spinner,
  Skeleton,
} from "@/components/ui";
import { useSession } from "@/services";
import {
  dashboardService,
  type DashboardStats,
  type DashboardProperty,
  type RecentActivity,
} from "@/services";

export default function AgentDashboardPage() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [properties, setProperties] = useState<DashboardProperty[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError(null);
        const data = await dashboardService.getAll();
        console.log("Dashboard data:", data);
        setStats(data?.stats || null);
        setRecentActivity(data?.recentActivity || []);
        setProperties(data?.properties || []);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        setError("ไม่สามารถโหลดข้อมูล Dashboard ได้");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboard();
    } else if (!isPending) {
      setIsLoading(false);
    }
  }, [session, isPending]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return "เมื่อสักครู่";
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">ใช้งาน</Badge>;
      case "pending":
        return <Badge variant="warning">รอดำเนินการ</Badge>;
      case "draft":
        return <Badge variant="secondary">ฉบับร่าง</Badge>;
      case "sold":
        return <Badge variant="default">ขายแล้ว</Badge>;
      case "rented":
        return <Badge variant="default">ให้เช่าแล้ว</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const statCards = [
    {
      title: "รายได้รวม",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-emerald-600",
    },
    {
      title: "อสังหาทั้งหมด",
      value: stats?.totalProperties || 0,
      icon: <Building2 className="h-5 w-5" />,
      color: "bg-blue-500",
    },
    {
      title: "ความต้องการที่ตรงกัน",
      value: stats?.matchedDemands || 0,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-pink-500",
    },
    {
      title: "ยอดเข้าชม",
      value: stats?.totalViews || 0,
      icon: <Eye className="h-5 w-5" />,
      color: "bg-purple-500",
    },
    {
      title: "ผู้สนใจติดต่อ",
      value: stats?.totalInquiries || 0,
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-orange-500",
    },
    {
      title: "คำขอรอดำเนินการ",
      value: stats?.pendingRequests || 0,
      icon: <FileText className="h-5 w-5" />,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                ยินดีต้อนรับกลับ, {session?.user?.name || "ตัวแทน"}
              </p>
            </div>
            <Link href="/post-property">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                ลงประกาศใหม่
              </Button>
            </Link>
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
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

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? [...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
              : statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color} text-white`}
                      >
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  กิจกรรมล่าสุด
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    ยังไม่มีกิจกรรม
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent transition-colors"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${activity.type === "view"
                              ? "bg-blue-500/10 text-blue-500"
                              : activity.type === "inquiry"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-purple-500/10 text-purple-500"
                            }`}
                        >
                          {activity.type === "view" ? (
                            <Eye className="h-4 w-4" />
                          ) : activity.type === "inquiry" ? (
                            <MessageSquare className="h-4 w-4" />
                          ) : (
                            <TrendingUp className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Properties */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  อสังหาของฉัน
                </CardTitle>
                <Link href="/my-properties">
                  <Button variant="ghost" size="sm">
                    ดูทั้งหมด
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      ยังไม่มีอสังหาริมทรัพย์
                    </p>
                    <Link href="/post-property">
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        ลงประกาศแรก
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <Link
                        key={property.id}
                        href={`/properties/${property.slug || property.id}`}
                        className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                      >
                        {property.thumbnail ? (
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                            <Image
                              src={property.thumbnail}
                              alt={property.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {property.title}
                          </p>
                          <p className="text-sm text-primary font-semibold">
                            {formatPrice(property.price)}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              {property.views}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              {property.inquiries}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(property.status)}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Matched Demands */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                ความต้องการที่ตรงกัน
              </CardTitle>
              <Link href="/matched-demands">
                <Button variant="ghost" size="sm">
                  ดูทั้งหมด
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-linear-to-r from-primary/10 to-primary/5 p-6 text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg">
                  {isLoading ? (
                    <Skeleton className="h-6 w-48 mx-auto" />
                  ) : (
                    `มี ${stats?.matchedDemands || 0} ความต้องการที่ตรงกับอสังหาของคุณ`
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  ระบบ AI
                  จับคู่ความต้องการของผู้ซื้อกับอสังหาริมทรัพย์ของคุณอัตโนมัติ
                </p>
                <Link href="/matched-demands">
                  <Button className="mt-4">ดูความต้องการทั้งหมด</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
