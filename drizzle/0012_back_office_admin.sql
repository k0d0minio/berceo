ALTER TYPE "public"."admin_action" ADD VALUE 'compte_suspendu';--> statement-breakpoint
ALTER TYPE "public"."admin_action" ADD VALUE 'compte_reactive';--> statement-breakpoint
ALTER TYPE "public"."admin_action" ADD VALUE 'compte_supprime';--> statement-breakpoint
ALTER TYPE "public"."admin_action" ADD VALUE 'utilisateur_contacte';--> statement-breakpoint
ALTER TYPE "public"."admin_action" ADD VALUE 'signalement_traite';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "report_handled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "report_handled_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_report_handled_by_users_id_fk" FOREIGN KEY ("report_handled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_reports_pending_idx" ON "bookings" USING btree ("cancelled_at") WHERE "bookings"."status" = 'annulee' AND "bookings"."report_handled_at" IS NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_report_handled" CHECK ("bookings"."report_handled_at" IS NULL OR "bookings"."status" = 'annulee');--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_deleted_suspended" CHECK ("users"."deleted_at" IS NULL OR "users"."suspended_at" IS NOT NULL);