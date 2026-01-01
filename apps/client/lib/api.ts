import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

// 1. Centralized API Configuration
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for Better-Auth cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// 2. Request Interceptor (Optional: for additional headers like device-id)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

// 3. Response Interceptor (Global Error Handling & Data Unwrapping)
api.interceptors.response.use(
  (response) => {
    // Automatically unwrap data -> Service layer receives clean data
    return response.data;
  },
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || data?.error || "Something went wrong";

    // Global Error Handling Strategy
    // Global Error Handling Strategy
    if (typeof window !== "undefined") {
      // Client-side: Show Toasts
      if (status === 401) {
        if (!window.location.pathname.includes("/auth")) {
          // toast.error("Session expired, please login again");
        }
      } else if (status === 403) {
        toast.error("You don't have permission to perform this action");
      } else if (status && status >= 500) {
        toast.error("Server error, please try again later");
      } else if (message) {
        toast.error(message);
      }
    } else {
      // Server-side: Log error
      console.error(`[API Error] ${status} - ${message}`);
    }

    return Promise.reject(error);
  }
);
