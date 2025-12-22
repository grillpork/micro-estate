// ===== Roles =====
export const ROLES = {
  USER: "user",
  AGENT: "agent",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ===== Property Status =====
export const PROPERTY_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PENDING: "pending",
  REJECTED: "rejected",
  SOLD: "sold",
  RENTED: "rented",
  INACTIVE: "inactive",
} as const;

export type PropertyStatus =
  (typeof PROPERTY_STATUS)[keyof typeof PROPERTY_STATUS];

// ===== Property Type =====
export const PROPERTY_TYPE = {
  HOUSE: "house",
  CONDO: "condo",
  TOWNHOUSE: "townhouse",
  LAND: "land",
  COMMERCIAL: "commercial",
  APARTMENT: "apartment",
} as const;

export type PropertyType = (typeof PROPERTY_TYPE)[keyof typeof PROPERTY_TYPE];

// ===== Listing Type =====
export const LISTING_TYPE = {
  SALE: "sale",
  RENT: "rent",
} as const;

export type ListingType = (typeof LISTING_TYPE)[keyof typeof LISTING_TYPE];

// ===== Pagination =====
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  DEFAULT_OFFSET: 0,
  MAX_LIMIT: 100,
} as const;

// ===== Cache TTL (seconds) =====
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

// ===== Demand Intent (Buy / Rent) =====
export const DEMAND_INTENT = {
  BUY: "buy",
  RENT: "rent",
} as const;

export type DemandIntent = (typeof DEMAND_INTENT)[keyof typeof DEMAND_INTENT];

// ===== Demand Urgency =====
export const DEMAND_URGENCY = {
  URGENT: "urgent", // ต้องการภายใน 1 เดือน
  NORMAL: "normal", // 2-3 เดือน
  NOT_RUSH: "not_rush", // ยังไม่รีบ
} as const;

export type DemandUrgency =
  (typeof DEMAND_URGENCY)[keyof typeof DEMAND_URGENCY];

// ===== Demand Status =====
export const DEMAND_STATUS = {
  ACTIVE: "active", // กำลังหา
  MATCHED: "matched", // เจอที่ตรงใจแล้ว
  CLOSED: "closed", // ปิดไปแล้ว (หาเจอหรือยกเลิก)
  EXPIRED: "expired", // หมดอายุ
} as const;

export type DemandStatus = (typeof DEMAND_STATUS)[keyof typeof DEMAND_STATUS];

// ===== Common Demand Tags =====
export const DEMAND_TAGS = {
  // Pet-related
  PET_FRIENDLY: "pet-friendly",
  NO_PETS: "no-pets",
  // Parking
  PARKING: "parking",
  NO_PARKING_NEEDED: "no-parking-needed",
  // Furniture
  FURNISHED: "furnished",
  UNFURNISHED: "unfurnished",
  PARTIALLY_FURNISHED: "partially-furnished",
  // Location
  NEAR_BTS: "near-bts",
  NEAR_MRT: "near-mrt",
  NEAR_AIRPORT_LINK: "near-airport-link",
  NEAR_MALL: "near-mall",
  NEAR_SCHOOL: "near-school",
  NEAR_HOSPITAL: "near-hospital",
  // Amenities
  POOL: "pool",
  GYM: "gym",
  SECURITY_24H: "security-24h",
  // Floor preference
  HIGH_FLOOR: "high-floor",
  LOW_FLOOR: "low-floor",
  // View
  CITY_VIEW: "city-view",
  RIVER_VIEW: "river-view",
  GARDEN_VIEW: "garden-view",
} as const;

export type DemandTag = (typeof DEMAND_TAGS)[keyof typeof DEMAND_TAGS];

// ===== Demand Limits =====
export const DEMAND_LIMITS = {
  MAX_ACTIVE_PER_USER: 5, // จำนวน demand ที่ active ได้พร้อมกัน
  MAX_AGENTS_PER_DEMAND: 5, // จำนวน agent สูงสุดที่รับต่อ demand
  EXPIRY_DAYS: 30, // หมดอายุหลังจากกี่วัน
  MAX_TAGS: 10, // จำนวน tags สูงสุด
} as const;
