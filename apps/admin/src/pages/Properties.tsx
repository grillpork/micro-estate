import { useState, useEffect } from "react";
import { propertiesService } from "@/services/properties.service";
import type { Property } from "@/services/properties.service";
import {
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bgColor: string }
> = {
  draft: {
    label: "รอตรวจสอบ",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100",
  },
  active: {
    label: "เผยแพร่แล้ว",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100",
  },
  pending: {
    label: "รอดำเนินการ",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-100",
  },
  rejected: {
    label: "ปฏิเสธ",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-100",
  },
  sold: {
    label: "ขายแล้ว",
    icon: CheckCircle2,
    color: "text-slate-600",
    bgColor: "bg-slate-50 border-slate-100",
  },
  rented: {
    label: "ปล่อยเช่าแล้ว",
    icon: CheckCircle2,
    color: "text-slate-600",
    bgColor: "bg-slate-50 border-slate-100",
  },
  inactive: {
    label: "ไม่ใช้งาน",
    icon: AlertCircle,
    color: "text-slate-400",
    bgColor: "bg-slate-50 border-slate-100",
  },
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  condo: "คอนโด",
  house: "บ้านเดี่ยว",
  townhouse: "ทาวน์เฮาส์",
  land: "ที่ดิน",
  apartment: "อพาร์ทเมนต์",
  commercial: "อาคารพาณิชย์",
};

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectModal, setRejectModal] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadProperties();
  }, [filter]);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        filter === "pending"
          ? await propertiesService.getPending()
          : await propertiesService.getAll();
      setProperties(data);
    } catch (err) {
      console.warn("Using mock properties data due to connection error");
      setProperties([
        {
          id: "1",
          title: "Luxury Condo in Sukhumvit",
          propertyType: "condo",
          listingType: "sale",
          status: "draft",
          price: "8500000",
          bedrooms: 2,
          bathrooms: 2,
          area: "75",
          district: "Wattana",
          province: "Bangkok",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rejectionReason: null,
          userId: "admin",
          slug: "luxury-condo",
        },
        {
          id: "2",
          title: "Modern House with Garden",
          propertyType: "house",
          listingType: "sale",
          status: "active",
          price: "15000000",
          bedrooms: 4,
          bathrooms: 3,
          area: "250",
          district: "Bang Na",
          province: "Bangkok",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rejectionReason: null,
          userId: "admin",
          slug: "modern-house",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("ยืนยันการอนุมัติประกาศนี้?")) return;
    setProcessing(id);
    try {
      await propertiesService.approve(id);
      await loadProperties();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setProcessing(rejectModal.id);
    try {
      await propertiesService.reject(rejectModal.id, rejectReason);
      setRejectModal(null);
      setRejectReason("");
      await loadProperties();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const filteredData = properties.filter(
    (p) =>
      (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.district || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.province || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Building2 className="w-3 h-3" />
            Listing Management
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Real Estate Listings
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Review, approve or manage properties across the platform.
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button
            onClick={() => setFilter("pending")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              filter === "pending"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                : "text-slate-500 hover:bg-slate-50"
            )}
          >
            รอตรวจสอบ
          </button>
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              filter === "all"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                : "text-slate-500 hover:bg-slate-50"
            )}
          >
            ทั้งหมด
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by title, district or province..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 transition-all outline-none shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-slate-200 mx-2" />
          <p className="text-sm font-bold text-slate-400">
            Total{" "}
            <span className="text-slate-800 font-black">
              {filteredData.length}
            </span>{" "}
            results
          </p>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 bg-slate-50 rounded-[32px] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-[40px] border-2 border-red-100">
            <AlertCircle className="w-16 h-16 text-red-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-800">{error}</h3>
            <button
              onClick={loadProperties}
              className="mt-4 text-red-600 font-bold hover:underline"
            >
              คลิกเพื่อลองอีกครั้ง
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-400">
              {filter === "pending"
                ? "ไม่มีประกาศที่รอตรวจสอบ"
                : "ยังไม่มีประกาศใดๆ ในระบบ"}
            </h3>
            <p className="text-slate-300 mt-2">
              All listings have been processed.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-8">
            {filteredData.map((property, idx) => {
              const status =
                STATUS_CONFIG[property.status] || STATUS_CONFIG.inactive;
              return (
                <motion.div
                  layout
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col lg:flex-row gap-8 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-300 relative overflow-hidden"
                >
                  {processing === property.id && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                  )}

                  {/* Image Section */}
                  <div className="w-full lg:w-72 h-52 shrink-0 rounded-[24px] overflow-hidden relative group/img">
                    {property.thumbnailUrl ? (
                      <img
                        src={property.thumbnailUrl}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                        alt=""
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <Building2 className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white shadow-xl shadow-black/10",
                          status.color
                        )}
                      >
                        <status.icon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 truncate mb-1 pr-10">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <MapPin className="w-3 h-3" />
                          {property.district || "N/A"},{" "}
                          {property.province || "N/A"}
                          <span className="mx-1 opacity-20">•</span>
                          <span className="text-blue-600">
                            {PROPERTY_TYPE_LABELS[property.propertyType] ||
                              property.propertyType}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">
                          {formatPrice(property.price)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          Posted on{" "}
                          {new Date(property.createdAt).toLocaleDateString(
                            "th-TH"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                      <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                        <BedDouble className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {property.bedrooms || 0}
                          <span className="text-[10px] text-slate-400 ml-1">
                            Beds
                          </span>
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                        <Bath className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {property.bathrooms || 0}
                          <span className="text-[10px] text-slate-400 ml-1">
                            Baths
                          </span>
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                        <Maximize className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {property.area || 0}
                          <span className="text-[10px] text-slate-400 ml-1">
                            m²
                          </span>
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {property.listingType === "sale" ? "Sale" : "Rent"}
                        </span>
                      </div>
                    </div>

                    {property.status === "rejected" &&
                      property.rejectionReason && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex gap-3"
                        >
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                          <p className="text-sm text-red-700 font-medium">
                            <strong>เหตุผลที่ปฏิเสธ:</strong>{" "}
                            {property.rejectionReason}
                          </p>
                        </motion.div>
                      )}

                    <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-blue-600 font-bold text-xs transition-colors group/btn">
                          <Eye className="w-4 h-4" />
                          Preview Listing
                          <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        {property.status === "draft" && (
                          <>
                            <button
                              onClick={() =>
                                setRejectModal({
                                  id: property.id,
                                  title: property.title,
                                })
                              }
                              className="px-6 py-2.5 rounded-xl border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(property.id)}
                              className="px-6 py-2.5 rounded-xl bg-slate-900 shadow-xl shadow-slate-200 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-blue-100 transition-all active:scale-95"
                            >
                              Approve Listing
                            </button>
                          </>
                        )}
                        {property.status !== "draft" && (
                          <button className="p-3 rounded-xl bg-slate-50 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <div>
        {rejectModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 selection:bg-red-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setRejectModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-500">
                  <XCircle className="w-6 h-6" />
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 pr-16 line-clamp-1">
                ปฏิเสธประกาศนี้?
              </h3>
              <p className="text-slate-500 font-medium mb-8">
                คุณกำลังจะปฏิเสธประกาศ{" "}
                <span className="text-slate-900 font-bold">
                  {rejectModal.title}
                </span>
              </p>

              <div className="space-y-2 mb-10">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                  Reason for rejection (Required)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="ระบุเหตุผลในการปฏิเสธเพื่อแจ้งให้ผู้ใช้งานทราบ เช่น ข้อมูลไม่ครบถ้วน, รูปภาพมีลายน้ำ ฯลฯ"
                  className="w-full border-2 border-slate-50 rounded-3xl p-6 text-sm min-h-[140px] focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-100 transition-all font-medium placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  className="py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processing !== null}
                  className="py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-100 disabled:opacity-50 transition-all"
                >
                  ยืนยันการปฏิเสธ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
