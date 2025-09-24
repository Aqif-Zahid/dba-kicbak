ALTER TYPE "public"."user_status" ADD VALUE 'WAITLISTED' BEFORE 'PENDING';--> statement-breakpoint
ALTER TABLE "waitlist_signups" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "waitlist_signups" CASCADE;--> statement-breakpoint
ALTER TABLE "email_events" DROP CONSTRAINT "email_events_signup_id_waitlist_signups_id_fk";
--> statement-breakpoint
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_signup_id_waitlist_signups_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username_desired" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "persona_selected" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invite_required" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referral_code_referral_codes_code_fk" FOREIGN KEY ("referral_code") REFERENCES "public"."referral_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" DROP COLUMN "signup_id";--> statement-breakpoint
ALTER TABLE "referrals" DROP COLUMN "signup_id";--> statement-breakpoint
DROP TYPE "public"."waitlist_status";