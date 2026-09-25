CREATE TYPE "public"."booking_side" AS ENUM('famille', 'professionnelle');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('confirmee', 'annulee');--> statement-breakpoint
CREATE TYPE "public"."cancellation_kind" AS ENUM('annulation', 'absence');--> statement-breakpoint
DROP INDEX "bookings_profile_night_key";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "status" "booking_status" DEFAULT 'confirmee' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancelled_by" "booking_side";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancelled_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancellation_kind" "cancellation_kind";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "reminder_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancelled_by_user_id_users_id_fk" FOREIGN KEY ("cancelled_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_reminder_pending_idx" ON "bookings" USING btree ("night_date") WHERE "bookings"."status" = 'confirmee' AND "bookings"."reminder_sent_at" IS NULL;--> statement-breakpoint
CREATE INDEX "bookings_absence_idx" ON "bookings" USING btree ("cancelled_at") WHERE "bookings"."cancellation_kind" = 'absence';--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_profile_night_key" ON "bookings" USING btree ("profile_id","night_date") WHERE "bookings"."status" = 'confirmee';--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancelled_at" CHECK (("bookings"."status" = 'annulee') = ("bookings"."cancelled_at" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancellation" CHECK (("bookings"."cancelled_at" IS NULL) = ("bookings"."cancelled_by" IS NULL) AND ("bookings"."cancelled_at" IS NULL) = ("bookings"."cancellation_kind" IS NULL));