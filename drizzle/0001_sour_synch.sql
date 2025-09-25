CREATE TYPE "public"."auth_provider" AS ENUM('LOCAL', 'GOOGLE', 'FACEBOOK', 'APPLE');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_provider" "auth_provider" DEFAULT 'LOCAL';