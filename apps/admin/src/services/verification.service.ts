import { api } from "@/lib/axios";

export interface VerificationRequest {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  type: "basic" | "identity";
  status: "pending" | "verified" | "rejected";
  data: any; // Dynamic data based on type
  createdAt: string;
}

export const verificationService = {
  getPending: async (level?: "basic" | "identity") => {
    const params = level ? { level } : {};
    const response = await api.get<{
      success: boolean;
      data: VerificationRequest[];
    }>("/verification/admin/pending", { params });
    return response.data.data;
  },

  review: async (
    id: string,
    action: "approve" | "reject",
    rejectReason?: string
  ) => {
    const response = await api.post<{ success: boolean }>(
      `/verification/admin/${id}/review`,
      {
        approved: action === "approve",
        rejectReason,
      }
    );
    return response.data;
  },
};
