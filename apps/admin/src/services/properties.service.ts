import { api } from "@/lib/axios";

export interface Property {
  id: string;
  title: string;
  slug: string;
  propertyType: string;
  listingType: string;
  status: string;
  price: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string | null;
  district: string | null;
  province: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  rejectionReason: string | null;
  userId: string;
}

export const propertiesService = {
  getPending: async (): Promise<Property[]> => {
    const response = await api.get<{
      success: boolean;
      data: Property[];
    }>("/properties/admin/pending");
    return response.data.data;
  },

  getAll: async (): Promise<Property[]> => {
    const response = await api.get<{
      success: boolean;
      data: Property[];
    }>("/properties/admin/all");
    return response.data.data;
  },

  approve: async (id: string): Promise<Property> => {
    const response = await api.post<{
      success: boolean;
      data: Property;
    }>(`/properties/admin/${id}/approve`);
    return response.data.data;
  },

  reject: async (id: string, reason: string): Promise<Property> => {
    const response = await api.post<{
      success: boolean;
      data: Property;
    }>(`/properties/admin/${id}/reject`, { reason });
    return response.data.data;
  },
};
