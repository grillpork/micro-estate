import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  amenitiesService,
  type Amenity,
  type CreateAmenityDto,
} from "@/services/amenities.service";
import {
  Plus,
  Search,
  Trash2,
  Filter,
  MapPin,
  Info,
  Check,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = [
  "general",
  "security",
  "recreation",
  "convenience",
  "parking",
  "wellness",
  "outdoor",
  "utilities",
];

export function AmenitiesPage() {
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Queries
  const { data: amenities, isLoading } = useQuery({
    queryKey: ["amenities", filterCategory],
    queryFn: async () => {
      try {
        return await amenitiesService.getAll(
          filterCategory ? { category: filterCategory } : undefined
        );
      } catch (e) {
        console.warn("Using mock amenities data");
        return [
          {
            id: "1",
            name: "Swimming Pool",
            nameTh: "สระว่ายน้ำ",
            category: "recreation",
            icon: "🏊",
            isActive: true,
            order: 1,
          },
          {
            id: "2",
            name: "24h Security",
            nameTh: "รปภ. 24 ชม.",
            category: "security",
            icon: "🛡️",
            isActive: true,
            order: 2,
          },
          {
            id: "3",
            name: "Gym",
            nameTh: "ฟิตเนส",
            category: "wellness",
            icon: "🏋️",
            isActive: true,
            order: 3,
          },
          {
            id: "4",
            name: "Parking",
            nameTh: "ที่จอดรถ",
            category: "parking",
            icon: "🚗",
            isActive: true,
            order: 4,
          },
        ];
      }
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["amenities", "stats"],
    queryFn: async () => {
      try {
        return await amenitiesService.getStats();
      } catch (e) {
        return {
          totalAmenities: 4,
          byCategory: { recreation: 1, security: 1, wellness: 1, parking: 1 },
          topUsed: [],
        };
      }
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: amenitiesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      queryClient.invalidateQueries({ queryKey: ["amenities", "stats"] });
      setNewAmenity({ name: "", category: "general", order: 0 });
      setShowAddForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: amenitiesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      queryClient.invalidateQueries({ queryKey: ["amenities", "stats"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      amenitiesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });

  const [newAmenity, setNewAmenity] = useState<CreateAmenityDto>({
    name: "",
    category: "general",
    order: 0,
    icon: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newAmenity);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanentely remove this amenity?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (amenity: Amenity) => {
    updateMutation.mutate({
      id: amenity.id,
      data: { isActive: !amenity.isActive },
    });
  };

  const filteredData = amenities?.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nameTh?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return (
      <div className="space-y-6 animate-pulse p-10">
        <div className="h-40 bg-slate-100 rounded-3xl w-full" />
        <div className="h-96 bg-slate-100 rounded-3xl w-full" />
      </div>
    );

  return (
    <div className="space-y-10">
      {/* Header & Stats Card */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-100/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              <MapPin className="w-3 h-3" />
              Asset Management
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              System Amenities
            </h1>
            <p className="text-slate-400 mt-2 font-medium max-w-md">
              Configure and manage the global list of amenities available for
              property listings. Changes here reflect across the platform
              instantly.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 min-w-[160px] backdrop-blur-sm">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                Total Assets
              </p>
              <p className="text-4xl font-black text-white">
                {stats?.totalAmenities || 0}
              </p>
            </div>
            <div className="bg-blue-600 rounded-3xl p-6 min-w-[160px] shadow-lg shadow-blue-900/50">
              <p className="text-blue-100/70 text-[10px] font-bold uppercase tracking-widest mb-1">
                Categories
              </p>
              <p className="text-4xl font-black text-white">
                {stats?.byCategory ? Object.keys(stats.byCategory).length : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100",
              showAddForm
                ? "bg-slate-100 text-slate-800"
                : "bg-blue-600 text-white shadow-blue-200"
            )}
          >
            {showAddForm ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {showAddForm ? "Close Form" : "Add New Amenity"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search amenities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm w-full md:w-64 focus:ring-4 focus:ring-blue-50 transition-all outline-none shadow-sm"
            />
          </div>

          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none pl-10 pr-10 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none shadow-sm cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-2 border-blue-50 rounded-[32px] p-8 shadow-xl shadow-blue-100/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Add New Global Amenity
                </h3>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                    Display Name (EN)
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    placeholder="e.g. Swimming Pool"
                    value={newAmenity.name}
                    onChange={(e) =>
                      setNewAmenity({ ...newAmenity, name: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                    Display Name (TH)
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    placeholder="เช่น สระว่ายน้ำ"
                    value={newAmenity.nameTh || ""}
                    onChange={(e) =>
                      setNewAmenity({ ...newAmenity, nameTh: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                    Category
                  </label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none cursor-pointer"
                    value={newAmenity.category}
                    onChange={(e) =>
                      setNewAmenity({ ...newAmenity, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                    Visual Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    placeholder="🏊"
                    value={newAmenity.icon || ""}
                    onChange={(e) =>
                      setNewAmenity({ ...newAmenity, icon: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                  >
                    {createMutation.isPending
                      ? "Connecting..."
                      : "Add to Global Registry"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredData?.map((amenity, idx) => (
            <motion.div
              key={amenity.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-white group p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-[28px] bg-slate-50 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500 shadow-inner">
                  {amenity.icon || "📍"}
                </div>
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm",
                    amenity.isActive ? "bg-emerald-500" : "bg-slate-300"
                  )}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>

              <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                {amenity.category}
              </span>

              <h3 className="text-lg font-bold text-slate-800 leading-tight">
                {amenity.name}
              </h3>
              {amenity.nameTh && (
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {amenity.nameTh}
                </p>
              )}

              <div className="mt-8 pt-6 border-t border-slate-50 w-full flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(amenity)}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider transition-colors",
                    amenity.isActive ? "text-emerald-500" : "text-slate-400"
                  )}
                >
                  {amenity.isActive ? "Active" : "Disabled"}
                </button>

                <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(amenity.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredData?.length === 0 && (
        <div className="py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-400">
            No amenities found
          </h3>
          <p className="text-slate-300 mt-2">
            Try adjusting your filters or search term.
          </p>
        </div>
      )}
    </div>
  );
}
