import { api } from "@/lib/api";

export interface VerificationStatus {
  verificationLevel: "none" | "basic" | "identity";
  maxListings: number;
  currentListings: number;
  canCreateListing: boolean;
  emailVerified: boolean;
  identityVerified: boolean;
  showBadge: string;
  latestRequest: {
    id: string;
    level: string;
    status: "pending" | "approved" | "rejected";
    rejectionReason: string | null;
    createdAt: string;
  } | null;
}

export const verificationService = {
  getStatus: async (): Promise<VerificationStatus> => {
    const res = await api.get("/verification/status");
    return res.data;
  },
};
