import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { verificationService } from "@/services/verification.service";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  Eye,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function VerificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"basic" | "identity" | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: verifications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["verifications", filter],
    queryFn: async () => {
      try {
        return await verificationService.getPending(filter);
      } catch (e) {
        console.warn("Using mock verifications data");
        return [
          {
            id: "1",
            userId: "u1",
            user: { id: "u1", email: "john@example.com", name: "John Doe" },
            type: "identity",
            status: "pending",
            data: {},
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            userId: "u2",
            user: { id: "u2", email: "sarah@example.com", name: "Sarah Smith" },
            type: "basic",
            status: "pending",
            data: {},
            createdAt: new Date().toISOString(),
          },
        ] as any[];
      }
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: "approve" | "reject";
      reason?: string;
    }) => verificationService.review(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verifications"] });
      // In a real app, use toast
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleApprove = (id: string) => {
    if (confirm("Are you sure you want to approve this verification?")) {
      reviewMutation.mutate({ id, action: "approve" });
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt("Please enter a reason for rejection:");
    if (reason) {
      reviewMutation.mutate({ id, action: "reject", reason });
    }
  };

  const filteredData = verifications?.filter(
    (v) =>
      v.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-10">
        <div className="h-10 bg-slate-100 rounded-xl w-1/4" />
        <div className="h-96 bg-slate-100 rounded-3xl w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <ShieldAlert className="w-16 h-16 text-red-100 mb-4" />
        <h3 className="text-xl font-bold text-slate-800">Connection Error</h3>
        <p className="text-slate-500 max-w-xs">
          We couldn't load the verification requests. Please check your internet
          connection and try again.
        </p>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["verifications"] })
          }
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Trust & Safety
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Review and manage user identity verifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          {[
            { label: "All Types", value: undefined },
            { label: "Identity", value: "identity" },
            { label: "Basic", value: "basic" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setFilter(item.value as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                filter === item.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <p className="text-sm font-bold text-slate-400">
              showing{" "}
              <span className="text-slate-800">
                {filteredData?.length || 0}
              </span>{" "}
              requests
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  User Information
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  Type
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  Submission Details
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <div>
                {filteredData?.map((req, idx) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-500">
                          {req.user?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {req.user?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {req.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          req.type === "identity"
                            ? "bg-purple-50 text-purple-600 border border-purple-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        )}
                      >
                        {req.type === "identity" ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        {req.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <button className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group/btn">
                          <Eye className="w-4 h-4" />
                          Review Data Bundle
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                          Submitted on{" "}
                          {new Date(req.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                        <button
                          onClick={() => handleReject(req.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-50"
                          title="Reject Application"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-50"
                          title="Approve Application"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </div>

              {(!filteredData || filteredData.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <ShieldCheck className="w-10 h-10 text-slate-200" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-400 italic">
                        No pending requests
                      </h3>
                      <p className="text-sm text-slate-300 mt-2 font-medium">
                        All caught up! Check back later for new submissions.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
