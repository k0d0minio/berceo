-- annulations-back-office: a founder cancels a garde for Berceo (booking_side 'berceo', her note in cancellation_note) and grants a credit of the fee by hand.
-- Two journal actions. No statement here uses a new enum value, so the migration runs in one transaction.
ALTER TYPE "public"."admin_action" ADD VALUE 'credit_accorde';--> statement-breakpoint
ALTER TYPE "public"."admin_action" ADD VALUE 'garde_annulee_berceo';--> statement-breakpoint
ALTER TYPE "public"."booking_side" ADD VALUE 'berceo';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancellation_note" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancellation_note" CHECK ("bookings"."cancellation_note" IS NULL OR "bookings"."cancellation_kind" = 'annulation');