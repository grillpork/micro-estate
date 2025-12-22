import { api } from "../api/api";

export interface Amenity {
  id: string;
  name: string;
  nameTh: string | null;
  description: string | null;
  descriptionTh: string | null;
  category: string;
  icon: string | null;
  order: number;
  isActive: boolean;
}

export interface GroupedAmenities {
  [category: string]: Amenity[];
}

export const amenitiesService = {
  /**
   * Get all amenities
   */
  getAll: async (): Promise<Amenity[]> => {
    const response = await api.get<{ data: Amenity[] }>("/amenities");
    return response.data.data;
  },

  /**
   * Get amenities grouped by category
   */
  getGrouped: async (): Promise<GroupedAmenities> => {
    const response = await api.get<{ data: GroupedAmenities }>(
      "/amenities/grouped"
    );
    return response.data.data;
  },

  /**
   * Get amenities for a specific property
   */
  getByPropertyId: async (propertyId: string): Promise<Amenity[]> => {
    const response = await api.get<{ data: Amenity[] }>(
      `/amenities/property/${propertyId}`
    );
    return response.data.data;
  },
};
