/**
 * API Client Configuration
 * Central axios instance with interceptors for auth and error handling
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

// API Base URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add auth token here if needed
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
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
        if (message) {
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

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
