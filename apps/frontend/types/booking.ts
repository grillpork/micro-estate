import type { Transaction } from "./payment";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  transactionId: string;
  status: BookingStatus;
  depositAmount: string;
  notes?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    price: string;
    thumbnailUrl: string | null;
  };
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  transaction?: Transaction;
}
