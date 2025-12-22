import { api } from "@/lib/axios";

export interface Amenity {
  id: string;
  name: string;
  nameTh?: string | null;
  description?: string | null;
  descriptionTh?: string | null;
  category: string;
  icon?: string | null;
  isActive: boolean;
  order: number;
}

export interface AmenityStats {
  totalAmenities: number;
  byCategory: Record<string, number>;
  topUsed: Array<{ amenity: string; count: number }>;
}

export interface CreateAmenityDto {
  name: string;
  nameTh?: string;
  description?: string;
  descriptionTh?: string;
  category: string;
  icon?: string;
  order?: number;
}

export type UpdateAmenityDto = Partial<CreateAmenityDto> & {
  isActive?: boolean;
};

export const amenitiesService = {
  getAll: async (params?: { category?: string; activeOnly?: boolean }) => {
    const response = await api.get<{ data: Amenity[] }>("/amenities", {
      params,
    });
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get<{ data: AmenityStats }>("/amenities/stats");
    return response.data.data;
  },

  create: async (data: CreateAmenityDto) => {
    const response = await api.post<{ data: Amenity }>("/amenities", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateAmenityDto) => {
    const response = await api.put<{ data: Amenity }>(`/amenities/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/amenities/${id}`);
  },
};
