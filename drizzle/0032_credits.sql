-- credits-registre: the Berceo credits, one row per credit with its origin and its expiry (the answers [9.2]).
-- A credit is a money record: every link is set null on delete, never cascaded. Nothing writes a row yet.
CREATE TYPE "public"."credit_origin" AS ENUM('annulation_famille', 'annulation_professionnelle', 'absence_professionnelle', 'annulation_berceo', 'geste_berceo');--> statement-breakpoint
CREATE TABLE "credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_user_id" uuid,
	"amount_cents" integer NOT NULL,
	"spent_cents" integer DEFAULT 0 NOT NULL,
	"origin" "credit_origin" NOT NULL,
	"payment_id" uuid,
	"booking_id" uuid,
	"granted_by_user_id" uuid,
	"note" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credits_amount_positive" CHECK ("credits"."amount_cents" > 0),
	CONSTRAINT "credits_spent_range" CHECK ("credits"."spent_cents" >= 0 AND "credits"."spent_cents" <= "credits"."amount_cents"),
	CONSTRAINT "credits_expiry_after_issue" CHECK ("credits"."expires_at" > "credits"."issued_at")
);
--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_family_user_id_users_id_fk" FOREIGN KEY ("family_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_granted_by_user_id_users_id_fk" FOREIGN KEY ("granted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credits_family_user_id_idx" ON "credits" USING btree ("family_user_id");