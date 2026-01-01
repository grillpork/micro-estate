/**
 * API Client Configuration
 * Central axios instance with interceptors for auth and error handling
 */
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

// API Base URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 seconds
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add auth token here if needed

    // If sending FormData, let the browser set the Content-Type (with boundary)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.response?.data?.error;

    // Handle common errors
    switch (status) {
      case 401:
        // Unauthorized - redirect to login or refresh token
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/sign-in")
        ) {
          // Don't show toast on auth pages
          toast.error("กรุณาเข้าสู่ระบบใหม่");
        }
        break;
      case 403:
        toast.error("คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
        break;
      case 404:
        // Silent - let individual handlers deal with it
        break;
      case 422:
        // Validation error - let form handlers deal with it
        break;
      case 500:
        toast.error("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
        break;
      default:
        // Global error toast for unhandled errors
        if (message && typeof window !== "undefined") {
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

/**
 * Standard API Response Wrapper
 * Used to unwrap the axios response and return data directly
 */
export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  },
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },
  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },
  patch: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },
};

// Helper for extracting error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "เกิดข้อผิดพลาด กรุณาลองใหม่";
};

export default api;
