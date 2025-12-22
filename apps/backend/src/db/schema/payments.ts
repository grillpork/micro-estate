import {
  pgTable,
  text,
  timestamp,
  numeric,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { properties } from "./properties";

// ===== Enums =====
export const transactionTypeEnum = pgEnum("transaction_type", [
  "booking_deposit", // มัดจำ/จองอสังหา
  "agent_fee", // ค่าธรรมเนียม Agent
  "featured_listing", // โปรโมทอสังหา
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending", // รอชำระ
  "processing", // กำลังดำเนินการ
  "successful", // สำเร็จ
  "failed", // ล้มเหลว
  "expired", // หมดอายุ (QR)
  "refunded", // คืนเงินแล้ว
  "partially_refunded", // คืนเงินบางส่วน
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "credit_card",
  "promptpay",
]);

// ===== Transactions Table =====
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),

  // User & Property
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id").references(() => properties.id, {
    onDelete: "set null",
  }),

  // Transaction Type
  type: transactionTypeEnum("type").notNull(),

  // Payment Details
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("THB"),
  paymentMethod: paymentMethodEnum("payment_method"),

  // Status
  status: transactionStatusEnum("status").notNull().default("pending"),

  // Omise Data
  omiseChargeId: text("omise_charge_id").unique(),
  omiseSourceId: text("omise_source_id"),
  omiseCustomerId: text("omise_customer_id"),

  // For PromptPay QR
  qrCodeUrl: text("qr_code_url"),

  // Metadata (for additional info like card brand, last 4 digits, etc.)
  metadata: jsonb("metadata").$type<{
    cardBrand?: string;
    lastDigits?: string;
    description?: string;
    featuredDays?: number; // for featured_listing
    [key: string]: unknown;
  }>(),

  // Failure Info
  failureCode: text("failure_code"),
  failureMessage: text("failure_message"),

  // Refund Info
  refundedAmount: numeric("refunded_amount", { precision: 15, scale: 2 }),
  refundedAt: timestamp("refunded_at"),

  // Timestamps
  paidAt: timestamp("paid_at"),
  expiredAt: timestamp("expired_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ===== Bookings Table (for property reservations) =====
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),

  // Booking status
  status: text("status", {
    enum: ["pending", "confirmed", "cancelled", "completed"],
  })
    .notNull()
    .default("pending"),

  // Deposit amount
  depositAmount: numeric("deposit_amount", {
    precision: 15,
    scale: 2,
  }).notNull(),

  // Notes
  notes: text("notes"),

  // Timestamps
  confirmedAt: timestamp("confirmed_at"),
  cancelledAt: timestamp("cancelled_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ===== Featured Listings Table =====
export const featuredListings = pgTable("featured_listings", {
  id: text("id").primaryKey(),

  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),

  // Featured period
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),

  // Status
  isActive: text("is_active", { enum: ["active", "expired", "cancelled"] })
    .notNull()
    .default("active"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ===== Relations =====
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [transactions.propertyId],
    references: [properties.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
  }),
  transaction: one(transactions, {
    fields: [bookings.transactionId],
    references: [transactions.id],
  }),
}));

export const featuredListingsRelations = relations(
  featuredListings,
  ({ one }) => ({
    property: one(properties, {
      fields: [featuredListings.propertyId],
      references: [properties.id],
    }),
    transaction: one(transactions, {
      fields: [featuredListings.transactionId],
      references: [transactions.id],
    }),
  })
);
