"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Home,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ExternalLink,
  Search,
  Building2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/services";
import { bookingsService } from "@/services";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Spinner,
  Input,
} from "@/components/ui";
import type { Booking } from "@/types/booking";
import { cn } from "@/lib";
import { toast } from "sonner";

export default function BookingsPage() {
  const { data: session } = useSession();
  const user = session?.user as
    | ({ role?: string } & {
        id: string;
        name?: string | null;
        email: string;
        image?: string | null;
      })
    | undefined;
  const [activeTab, setActiveTab] = useState<"my" | "agent">("my");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const isAgent = user?.role === "agent" || user?.role === "admin";

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data =
        activeTab === "my"
          ? await bookingsService.getMyBookings()
          : await bookingsService.getAgentBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("ไม่สามารถโหลดข้อมูลการจองได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await bookingsService.updateStatus(id, status);
      toast.success("อัปเดตสถานะการจองเรียบร้อยแล้ว");
      fetchBookings();
    } catch (error) {
      toast.error("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-500">ยืนยันแล้ว</Badge>;
      case "pending":
        return <Badge variant="secondary">รอการยืนยัน</Badge>;
      case "cancelled":
        return <Badge variant="destructive">ยกเลิกแล้ว</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">เสร็จสิ้น</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("th-TH").format(Number(price));
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.property?.title?.toLowerCase().includes(searchLower) ||
      booking.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">รายการจองอสังหาริมทรัพย์</h1>
          <p className="text-muted-foreground">
            จัดการและติดตามสถานะการจองของคุณ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาตามชื่อโครงการ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {isAgent && (
        <div className="flex p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("my")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === "my"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            รายการจองของฉัน
          </button>
          <button
            onClick={() => setActiveTab("agent")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === "agent"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            การจองที่ต้องดูแล
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground animate-pulse">
            กำลังโหลดข้อมูลการจอง...
          </p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">ไม่พบรายการจอง</h3>
            <p className="text-muted-foreground mt-1 max-w-xs">
              {searchQuery
                ? "ไม่พบรายการที่ตรงกับคำค้นหาของคุณ"
                : activeTab === "my"
                  ? "คุณยังไม่มีรายการจองอสังหาริมทรัพย์ในขณะนี้"
                  : "ยังไม่มีผู้จองอสังหาริมทรัพย์ของคุณ"}
            </p>
            {!searchQuery && activeTab === "my" && (
              <Button asChild className="mt-6">
                <Link href="/properties">ไปดูประกาศแนะนำ</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="group hover:shadow-md transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    {/* Property Image */}
                    <div className="relative h-24 w-full md:w-32 rounded-lg overflow-hidden shrink-0 bg-muted">
                      {booking.property?.thumbnailUrl ? (
                        <Image
                          src={booking.property.thumbnailUrl}
                          alt={booking.property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <Building2 className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground uppercase">
                          #{booking.id}
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>
                      <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                        {booking.property?.title || "อสังหาริมทรัพย์ถูกลบ"}
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> วันที่จอง
                          </span>
                          <span className="text-sm font-medium">
                            {formatDate(booking.createdAt)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> วันที่สิ้นสุด
                          </span>
                          <span className="text-sm font-medium">
                            {formatDate(booking.expiresAt)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            เงินมัดจำ
                          </span>
                          <span className="text-sm font-bold text-emerald-600">
                            ฿{formatPrice(booking.depositAmount)}
                          </span>
                        </div>
                        {activeTab === "agent" && (
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" /> ผู้จอง
                            </span>
                            <span className="text-sm truncate">
                              {booking.user?.name ||
                                booking.user?.email ||
                                "ไม่ระบุ"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 md:flex-col shrink-0">
                      {activeTab === "agent" &&
                        booking.status === "confirmed" && (
                          <>
                            <Button
                              size="sm"
                              className="w-full h-8 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() =>
                                handleUpdateStatus(booking.id, "completed")
                              }
                            >
                              เสร็จสิ้น
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-8 text-destructive"
                              onClick={() =>
                                handleUpdateStatus(booking.id, "cancelled")
                              }
                            >
                              ยกเลิก
                            </Button>
                          </>
                        )}

                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full h-8"
                      >
                        <Link href={`/properties/${booking.propertyId}`}>
                          รายละเอียด <ChevronRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
