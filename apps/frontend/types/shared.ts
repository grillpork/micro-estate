// ===== User Types =====
export type Role = "user" | "agent" | "admin";

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  phone: string | null;
  bio: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
}

// ===== Property Types =====
export type PropertyType =
  | "condo"
  | "house"
  | "townhouse"
  | "land"
  | "apartment"
  | "commercial";
export type PropertyStatus =
  | "available"
  | "sold"
  | "rented"
  | "pending"
  | "rejected";
export type ListingType = "sale" | "rent";

export interface Property {
  id: string;
  title: string;
  description: string;
  slug?: string;
  price: number | string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  landArea: number | null;
  floor: number | null;
  floors: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  parking: number | null;
  // Location fields (flattened from backend)
  address?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  // Media
  thumbnailUrl?: string | null;
  // Features
  features?: string | string[] | null;
  // Relations
  agentId?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  location?: Location;
  images?: PropertyImage[];
  amenities?: PropertyAmenityDetail[] | string | null;
  agent?: User;
  // Stats
  views?: number;
  favorites?: number;
  isFeatured?: boolean;
}

export interface PropertyAmenityDetail {
  id: string;
  propertyId: string;
  amenityId: string;
  note: string | null;
  createdAt: Date;
  amenity: Amenity;
}

export interface Location {
  id: string;
  propertyId: string;
  address: string;
  district: string;
  province: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  order: number;
}

export interface Amenity {
  id: string;
  name: string;
  nameTh?: string;
  icon: string | null;
  category: string;
}

// ===== Chat Types =====
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrls: string[] | null;
  isRead: boolean;
  createdAt: Date;
  sender?: User;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessageAt: Date;
  createdAt: Date;
  participant1?: User;
  participant2?: User;
  messages?: Message[];
}

export interface ConversationPreview {
  partnerId: string;
  partnerName: string | null;
  partnerImage: string | null;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  isOnline: boolean;
}

// ===== Demand Types =====
export type DemandStatus = "active" | "matched" | "fulfilled" | "expired";

export interface Demand {
  id: string;
  userId: string;
  title: string;
  description: string;
  propertyType: PropertyType[] | null;
  listingType: ListingType | null;
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  maxBedrooms: number | null;
  minBathrooms: number | null;
  maxBathrooms: number | null;
  minArea: number | null;
  maxArea: number | null;
  preferredLocations: string[] | null;
  amenities: string[] | null;
  status: DemandStatus;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Verification Types =====
export type VerificationStatus =
  | "pending"
  | "processing"
  | "verified"
  | "rejected"
  | "expired";

export interface AgentVerification {
  id: string;
  userId: string;
  idCardImageUrl: string;
  selfieImageUrl: string;
  licenseImageUrl: string | null;
  status: VerificationStatus;
  rejectionReason: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== API Response Types =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ===== Form Types =====
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  propertyType: PropertyType;
  listingType: ListingType;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  landArea?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  parking?: number;
  address: string;
  district: string;
  province: string;
  subDistrict: string;
  postalCode?: string;
  amenityIds?: string[];
  images?: (File | string)[];
  rai?: number;
  ngan?: number;
  sqWah?: number;
}

export interface DemandFormData {
  title: string;
  description: string;
  propertyType?: PropertyType[];
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  preferredLocations?: string[];
  amenities?: string[];
}
