import type { Context } from "hono";

// ===== Auth User Type =====
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

// ===== Hono App Type =====
export type AppEnv = {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
};

// ===== API Response Types =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ===== Pagination Types =====
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
