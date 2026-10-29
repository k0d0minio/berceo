-- annulations-delai-et-motif: the reason a side chose when it cancelled its garde, and the founders' cancellation delay.
-- The column is nullable: an absence has no reason, and neither has a garde cancelled before this migration.
-- The setting's row holds the default of 24 hours. A second run of the insert keeps the founders' value.
CREATE TYPE "public"."cancellation_reason" AS ENUM('plus_besoin', 'imprevu', 'autre_solution', 'malade', 'empechement', 'indisponible', 'autre');--> statement-breakpoint
ALTER TYPE "public"."admin_action" ADD VALUE 'reglage_delai_annulation';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancellation_reason" "cancellation_reason";--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancellation_reason" CHECK ("bookings"."cancellation_reason" IS NULL OR "bookings"."cancellation_kind" = 'annulation');--> statement-breakpoint
INSERT INTO "app_settings" ("key", "value") VALUES ('delai_annulation_heures', '24'::jsonb) ON CONFLICT ("key") DO NOTHING;
