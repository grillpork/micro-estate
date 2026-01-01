export interface Property {
  id: string;
  title: string;
  slug: string;
  price: number;
  description?: string;
  address?: string;
  images: string[];
  thumbnailUrl?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  type?: string;
  status?: string;
}

// Pagination & API Response Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  offset: number;
}

export interface PropertyFilters extends PaginationParams {
  q?: string;
  priceMin?: number;
  priceMax?: number;
  propertyType?: string;
  listingType?: string;
  province?: string;
  thumbnailUrl?: string;
}
