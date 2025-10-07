CREATE TYPE "public"."comment_status" AS ENUM('VISIBLE', 'EDITED', 'DELETED');--> statement-breakpoint
ALTER TYPE "public"."post_status" ADD VALUE 'DELETED';--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "status" "comment_status" DEFAULT 'VISIBLE' NOT NULL;