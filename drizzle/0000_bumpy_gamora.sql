CREATE TYPE "public"."email_event" AS ENUM('SEND_CONFIRM', 'CONFIRM_CLICKED', 'WELCOME_SENT');--> statement-breakpoint
CREATE TYPE "public"."profile_role" AS ENUM('TRAVELER', 'OPERATOR', 'CREATOR', 'AGENT', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."referral_code_type" AS ENUM('WAITLIST', 'CAMPAIGN');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('CLICKED', 'SIGNED_UP', 'CONFIRMED', 'ACTIVATED');--> statement-breakpoint
CREATE TYPE "public"."rewards_reason" AS ENUM('REFERRAL_SIGNUP', 'REFERRAL_ACTIVATION', 'INVITE_BOUNTY', 'MANUAL_ADJUST');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('PENDING', 'ACTIVE', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('UNCONFIRMED', 'CONFIRMED', 'ACTIVATED');--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"signup_id" integer,
	"email" text,
	"event" "email_event" NOT NULL,
	"provider_id" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"code" text PRIMARY KEY NOT NULL,
	"type" "referral_code_type" NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "referrals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"referrer_user_id" integer,
	"referred_email" text,
	"referred_user_id" integer,
	"referral_code" text,
	"signup_id" integer,
	"status" "referral_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"last_event_at" timestamp with time zone,
	CONSTRAINT "referrals_referrer_user_id_unique" UNIQUE("referrer_user_id"),
	CONSTRAINT "referrals_referred_user_id_unique" UNIQUE("referred_user_id")
);
--> statement-breakpoint
CREATE TABLE "rewards_ledger" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rewards_ledger_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"delta_points" integer NOT NULL,
	"reason" "rewards_reason" NOT NULL,
	"ref_id" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"status" "user_status" NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"role" "profile_role" NOT NULL,
	"persona_tags" jsonb DEFAULT '[]'::jsonb,
	"position_number" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_position_number_unique" UNIQUE("position_number")
);
--> statement-breakpoint
CREATE TABLE "waitlist_signups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "waitlist_signups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"email" text NOT NULL,
	"username_desired" text,
	"persona_selected" jsonb DEFAULT '[]'::jsonb,
	"source" text,
	"referral_code" text,
	"referrer_user_id" integer,
	"invite_required" boolean DEFAULT true,
	"status" "waitlist_status" NOT NULL,
	"position_number" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_signup_id_waitlist_signups_id_fk" FOREIGN KEY ("signup_id") REFERENCES "public"."waitlist_signups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_users_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_code_referral_codes_code_fk" FOREIGN KEY ("referral_code") REFERENCES "public"."referral_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_signup_id_waitlist_signups_id_fk" FOREIGN KEY ("signup_id") REFERENCES "public"."waitlist_signups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards_ledger" ADD CONSTRAINT "rewards_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_signups" ADD CONSTRAINT "waitlist_signups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_signups" ADD CONSTRAINT "waitlist_signups_referral_code_referral_codes_code_fk" FOREIGN KEY ("referral_code") REFERENCES "public"."referral_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_signups" ADD CONSTRAINT "waitlist_signups_referrer_user_id_users_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;