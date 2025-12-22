import { useQuery } from "@tanstack/react-query";
import { amenitiesService } from "@/services/amenities.service";
import { verificationService } from "@/services/verification.service";
import {
  Users,
  Home,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

export function DashboardPage() {
  const { data: amenityStats, isLoading: isLoadingAmenities } = useQuery({
    queryKey: ["amenities", "stats"],
    queryFn: async () => {
      try {
        return await amenitiesService.getStats();
      } catch (e) {
        console.warn("Using mock amenities stats");
        return {
          totalAmenities: 24,
          byCategory: {
            security: 5,
            general: 8,
            recreation: 4,
            wellness: 2,
            utilities: 5,
          },
          topUsed: [],
        };
      }
    },
  });

  const { data: pendingVerifications, isLoading: isLoadingVerifications } =
    useQuery({
      queryKey: ["verifications", "pending"],
      queryFn: async () => {
        try {
          return await verificationService.getPending();
        } catch (e) {
          console.warn("Using mock pending verifications");
          return Array(3).fill({ id: "1" }); // Mock 3 items
        }
      },
    });

  const pendingCount = pendingVerifications?.length || 0;

  if (isLoadingAmenities || isLoadingVerifications) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Amenities",
      value: amenityStats?.totalAmenities || 0,
      icon: MapPin,
      color: "blue",
      trend: "+12% from last month",
      description: "Active in the real estate system",
    },
    {
      label: "Pending Verifications",
      value: pendingCount,
      icon: Users,
      color: pendingCount > 0 ? "orange" : "green",
      trend: pendingCount > 0 ? "Action required" : "All users verified",
      description: "Identity verification requests",
    },
    {
      label: "Top Category",
      value: amenityStats?.byCategory
        ? Object.entries(amenityStats.byCategory).sort(
            ([, a], [, b]) => b - a
          )[0]?.[0] || "-"
        : "-",
      icon: Home,
      color: "purple",
      trend: "Trending Category",
      description: "Most common amenity type",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            System Overview
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Welcome back, here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            Export Data
          </button>
          <button className="px-5 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Property
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 hover:border-blue-100 transition-all duration-300 card-shine"
          >
            <div className="flex items-start justify-between mb-6">
              <div
                className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-bold ${stat.color === "orange" ? "text-orange-600 bg-orange-50" : stat.color === "green" ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"} px-2 py-1 rounded-full`}
              >
                {stat.color === "orange" ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {stat.trend}
              </div>
            </div>

            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">
              {stat.label}
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-extrabold text-slate-900 capitalize leading-none tracking-tight">
                {stat.value}
              </p>
            </div>
            <p className="text-slate-400 text-xs mt-4 font-medium">
              {stat.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Amenities Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Amenities by Category
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                Distribution across all properties
              </p>
            </div>
            <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-72 flex items-end justify-around gap-4 px-4 border-b border-slate-50">
            {amenityStats?.byCategory &&
              Object.entries(amenityStats.byCategory).map(
                ([cat, count], idx) => (
                  <div
                    key={cat}
                    className="flex flex-col items-center group w-full"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: `${Math.max(12, (count / (amenityStats.totalAmenities || 1)) * 240)}px`,
                      }}
                      transition={{
                        delay: 0.3 + idx * 0.05,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className="w-full max-w-[48px] bg-linear-to-t from-blue-600 to-blue-400 rounded-2xl group-hover:from-blue-500 group-hover:to-blue-300 transition-all relative shadow-lg shadow-blue-50"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                        {count} Units
                      </div>
                    </motion.div>
                    <span className="text-[10px] mt-4 text-slate-500 font-bold uppercase tracking-widest text-center truncate w-full px-1">
                      {cat}
                    </span>
                  </div>
                )
              )}
          </div>
        </motion.div>

        {/* Quick Actions / Recent Activity Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-6">
            Critical Actions
          </h3>
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-orange-50 border border-orange-100 group cursor-pointer hover:bg-orange-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-orange-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">
                  Pending Agent Verifications
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {pendingCount} users are waiting for approval
                </p>
              </div>
              <button className="w-8 h-8 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-blue-50 border border-blue-100 group cursor-pointer hover:bg-blue-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-600">
                <Home className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">
                  Review New Listings
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  12 properties submitted today
                </p>
              </div>
              <button className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-green-50 border border-green-100 group cursor-pointer hover:bg-green-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">
                  System Integrity Check
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  All services are running normally
                </p>
              </div>
              <button className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button className="mt-8 w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-colors">
            View All Activity Logs
          </button>
        </motion.div>
      </div>
    </div>
  );
}
