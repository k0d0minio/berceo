CREATE TYPE "public"."feeding" AS ENUM('allaitement_maternel', 'lait_infantile', 'allaitement_mixte');--> statement-breakpoint
ALTER TYPE "public"."care_request_children" ADD VALUE 'triples';--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "feeding" "feeding";