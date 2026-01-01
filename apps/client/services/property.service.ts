import { api } from "@/lib/api";
import { Property, PropertyFilters, PaginatedResponse } from "@/types/property";

export const propertyService = {
  // 1. Read Operations (Query)
  getAll: async (
    params?: PropertyFilters
  ): Promise<PaginatedResponse<Property>> => {
    // API instance automatically unwraps data
    return api.get("/properties", { params });
  },

  getBySlug: async (slug: string): Promise<Property> => {
    const res = (await api.get(`/properties/${slug}`)) as any;
    return res.data || res;
  },

  getById: async (id: string): Promise<Property> => {
    const res = (await api.get(`/properties/${id}`)) as any;
    return res.data || res;
  },

  // 2. Write Operations (Mutation)
  create: async (data: any): Promise<Property> => {
    const res = (await api.post("/properties", data)) as any;
    return res.data || res;
  },

  update: async (id: string, data: Partial<Property>): Promise<Property> => {
    return api.patch(`/properties/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/properties/${id}`);
  },
};
