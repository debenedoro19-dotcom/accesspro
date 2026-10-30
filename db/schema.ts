import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  real,
  uuid,
} from "drizzle-orm/pg-core";

/* ── Users & sessions ─────────────────────────────────────────── */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("homeowner"), // provider | homeowner | admin
  region: text("region").notNull().default("US"),
  phone: text("phone").notNull().default(""),
  city: text("city").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

/* ── Provider profiles & verification ─────────────────────────── */

export type StoredDocument = { type: string; name: string; uploadedAt: string };

export const providerProfiles = pgTable("provider_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  trades: jsonb("trades").$type<string[]>().notNull().default([]),
  yearsExperience: integer("years_experience").notNull().default(0),
  hourlyRate: integer("hourly_rate").notNull().default(0),
  radiusKm: integer("radius_km").notNull().default(40),
  bio: text("bio").notNull().default(""),
  availability: text("availability").notNull().default("Weekdays"),
  specialties: jsonb("specialties").$type<string[]>().notNull().default([]),
  // unverified → facial_pending → fully_verified  (rejected resets to unverified)
  verificationStatus: text("verification_status").notNull().default("unverified"),
  documents: jsonb("documents").$type<StoredDocument[]>().notNull().default([]),
  facialCompletedAt: timestamp("facial_completed_at"),
  profileStrength: integer("profile_strength").notNull().default(15),
  rating: real("rating").notNull().default(5),
  jobsCompleted: integer("jobs_completed").notNull().default(0),
  flagged: boolean("flagged").notNull().default(false),
  reviewNote: text("review_note").notNull().default(""),
});

export const verificationTokens = pgTable("verification_tokens", {
  token: text("token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});

/* ── Marketplace ──────────────────────────────────────────────── */

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  homeownerId: uuid("homeowner_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  region: text("region").notNull().default("US"),
  city: text("city").notNull().default(""),
  address: text("address").notNull().default(""),
  distanceKm: real("distance_km").notNull().default(5),
  urgency: text("urgency").notNull().default("standard"), // emergency | urgent | standard
  payMin: integer("pay_min").notNull(),
  payMax: integer("pay_max").notNull(),
  payFinal: integer("pay_final"),
  status: text("status").notNull().default("open"), // open | accepted | in_progress | completed | cancelled
  needsAccess: boolean("needs_access").notNull().default(false),
  lockBrand: text("lock_brand").notNull().default("manual"),
  windowLabel: text("window_label").notNull().default("Flexible"),
  photoName: text("photo_name").notNull().default(""),
  acceptedById: uuid("accepted_by_id").references(() => users.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobs.id),
  proId: uuid("pro_id").notNull().references(() => users.id),
  homeownerId: uuid("homeowner_id").notNull().references(() => users.id),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ── Temporary access credentials ─────────────────────────────── */

export type AccessEvent = { at: string; type: string; label: string };

export const accessCodes = pgTable("access_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobs.id),
  providerId: uuid("provider_id").notNull().references(() => users.id),
  homeownerId: uuid("homeowner_id").notNull().references(() => users.id),
  brand: text("brand").notNull().default("manual"),
  code: text("code").notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled | active | expired | revoked
  events: jsonb("events").$type<AccessEvent[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ── Email outbox (demo delivery) ─────────────────────────────── */

export const emails = pgTable("emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull(),
  kind: text("kind").notNull().default("general"),
  bodyHtml: text("body_html").notNull(),
  token: text("token").notNull().default(""),
  openedAt: timestamp("opened_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ── Activity, disputes, regions, analytics ───────────────────── */

export const activity = pgTable("activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull().default("info"),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const disputes = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id"),
  subject: text("subject").notNull(),
  detail: text("detail").notNull().default(""),
  region: text("region").notNull().default("US"),
  status: text("status").notNull().default("open"), // open | resolved
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const regionSettings = pgTable("region_settings", {
  region: text("region").primaryKey(),
  active: boolean("active").notNull().default(true),
  demandMultiplier: real("demand_multiplier").notNull().default(1),
  featured: jsonb("featured").$type<string[]>().notNull().default([]),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type ProviderProfile = typeof providerProfiles.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type AccessCode = typeof accessCodes.$inferSelect;
export type Email = typeof emails.$inferSelect;