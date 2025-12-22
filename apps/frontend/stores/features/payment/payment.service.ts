/**
 * Payment Service
 * Handles all payment-related API calls to Omise
 */
import api from "../api/api";
import type {
  CreatePaymentRequest,
  PaymentResponse,
  Transaction,
} from "@/types/payment";

// Backend response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const paymentService = {
  /**
   * Create a new payment
   */
  createPayment: async (
    data: CreatePaymentRequest
  ): Promise<PaymentResponse> => {
    const response = await api.post<ApiResponse<PaymentResponse>>(
      "/payments",
      data
    );
    return response.data.data;
  },

  /**
   * Get user's transactions
   */
  getTransactions: async (limit = 20): Promise<Transaction[]> => {
    const response = await api.get<ApiResponse<Transaction[]>>("/payments", {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get transaction by ID
   */
  getTransactionById: async (id: string): Promise<Transaction> => {
    const response = await api.get<ApiResponse<Transaction>>(`/payments/${id}`);
    return response.data.data;
  },

  /**
   * Poll transaction status (for PromptPay)
   */
  pollTransactionStatus: async (
    id: string,
    maxAttempts = 60,
    intervalMs = 5000
  ): Promise<Transaction> => {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const transaction = await paymentService.getTransactionById(id);

          // If status is terminal, stop polling
          if (
            transaction.status === "successful" ||
            transaction.status === "failed" ||
            transaction.status === "expired"
          ) {
            return resolve(transaction);
          }

          // Continue polling
          attempts++;
          if (attempts >= maxAttempts) {
            return reject(new Error("Payment timeout"));
          }

          setTimeout(poll, intervalMs);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  },
};

export default paymentService;
