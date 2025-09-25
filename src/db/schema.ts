import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  primaryKey,
  unique,
  foreignKey,
  serial,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ===== Enums =====
export const userStatusEnum = pgEnum("user_status", [
  "WAITLISTED",
  "PENDING",
  "ACTIVE",
  "BLOCKED",
]);
export const profileRoleEnum = pgEnum("profile_role", [
  "TRAVELER",
  "OPERATOR",
  "CREATOR",
  "AGENT",
  "ADMIN",
]);
export const referralCodeTypeEnum = pgEnum("referral_code_type", [
  "WAITLIST",
  "CAMPAIGN",
]);
export const referralStatusEnum = pgEnum("referral_status", [
  "CLICKED",
  "SIGNED_UP",
  "CONFIRMED",
  "ACTIVATED",
]);
export const rewardsReasonEnum = pgEnum("rewards_reason", [
  "REFERRAL_SIGNUP",
  "REFERRAL_ACTIVATION",
  "INVITE_BOUNTY",
  "MANUAL_ADJUST",
]);
export const emailEventEnum = pgEnum("email_event", [
  "SEND_CONFIRM",
  "CONFIRM_CLICKED",
  "WELCOME_SENT",
]);

export const authProviderEnum = pgEnum("auth_provider", [
  "LOCAL",
  "GOOGLE",
  "FACEBOOK",
  "APPLE",
]);
// ===== Tables =====

// Users
export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  status: userStatusEnum("status").notNull(),
  username: text("username").unique(),
  displayName: text("display_name"),
  role: profileRoleEnum("role").notNull(),
  personaTags: jsonb("persona_tags").default([]),
  positionNumber: integer("position_number").unique(),
  passwordHash: text("password_hash"),
  provider: authProviderEnum("auth_provider").default("LOCAL"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => sql`NOW()`),
  usernameDesired: text("username_desired"),
  personaSelected: jsonb("persona_selected").default([]),
  source: text("source"),
  referralCode: text("referral_code").references(() => referralCodes.code),
  inviteRequired: boolean("invite_required").default(true),
});

// Referral Codes
export const referralCodes = pgTable("referral_codes", {
  code: text("code").notNull().primaryKey(),
  type: referralCodeTypeEnum("type").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Referrals
export const referrals = pgTable(
  "referrals",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    referrerUserId: integer("referrer_user_id").references(() => users.id),
    referredEmail: text("referred_email"),
    referredUserId: integer("referred_user_id").references(() => users.id),
    referralCode: text("referral_code").references(() => referralCodes.code),
    status: referralStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    lastEventAt: timestamp("last_event_at", { withTimezone: true }),
  },
  (table) => ({
    referrerIdx: unique().on(table.referrerUserId),
    referredIdx: unique().on(table.referredUserId),
  })
);

// Rewards Ledger
export const rewardsLedger = pgTable("rewards_ledger", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  deltaPoints: integer("delta_points").notNull(),
  reason: rewardsReasonEnum("reason").notNull(),
  refId: integer("ref_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Email Events
export const emailEvents = pgTable("email_events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text("email"),
  event: emailEventEnum("event").notNull(),
  providerId: text("provider_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ===== Indexes & Constraints Notes (for manual migration if needed) =====
// profiles(username) => already unique
// waitlist_signups(email) => partial index (status in ('unconfirmed','confirmed','activated')) -- must be added manually in migration
// referral_codes(code) => already unique
// referrals(referrer_user_id), referrals(referred_user_id), referrals(status) => you can define indexes manually in migration or use `drizzle-kit`
