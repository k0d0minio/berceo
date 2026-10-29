-- annulations-table: a contested absence puts the garde in « litige » (disputed_at), and a contest voids the credit its report issued (voided_at).
-- One live credit per garde (credits_booking_live_key). Nullable columns only: the code before this migration reads and writes as before.
ALTER TABLE "bookings" ADD COLUMN "disputed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "disputed_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "credits" ADD COLUMN "voided_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_disputed_by_user_id_users_id_fk" FOREIGN KEY ("disputed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "credits_booking_live_key" ON "credits" USING btree ("booking_id") WHERE "credits"."booking_id" IS NOT NULL AND "credits"."voided_at" IS NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_dispute_on_absence" CHECK ("bookings"."disputed_at" IS NULL OR "bookings"."cancellation_kind" = 'absence');