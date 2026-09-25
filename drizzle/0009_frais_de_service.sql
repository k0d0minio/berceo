CREATE TYPE "public"."payment_status" AS ENUM('en_attente', 'payee', 'expiree', 'echouee', 'remboursee', 'remboursement_echoue');--> statement-breakpoint
CREATE TYPE "public"."refund_reason" AS ENUM('annulation_professionnelle', 'reservation_impossible', 'berceo', 'stripe');--> statement-breakpoint
ALTER TYPE "public"."admin_action" ADD VALUE 'frais_rembourses';--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid,
	"application_id" uuid,
	"family_user_id" uuid,
	"booking_id" uuid,
	"night_date" date NOT NULL,
	"night_rate_eur" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'eur' NOT NULL,
	"status" "payment_status" DEFAULT 'en_attente' NOT NULL,
	"stripe_session_id" text NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_refund_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"refund_reason" "refund_reason",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_booking_id_unique" UNIQUE("booking_id"),
	CONSTRAINT "payments_stripe_session_id_unique" UNIQUE("stripe_session_id"),
	CONSTRAINT "payments_amount_range" CHECK ("payments"."amount_cents" BETWEEN 300 AND 900),
	CONSTRAINT "payments_currency" CHECK ("payments"."currency" = 'eur'),
	CONSTRAINT "payments_paid_at" CHECK (("payments"."status" IN ('payee', 'remboursee', 'remboursement_echoue')) = ("payments"."paid_at" IS NOT NULL)),
	CONSTRAINT "payments_refund_pair" CHECK (("payments"."refunded_at" IS NULL) = ("payments"."refund_reason" IS NULL)),
	CONSTRAINT "payments_refunded" CHECK ("payments"."status" NOT IN ('remboursee', 'remboursement_echoue') OR "payments"."refunded_at" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_request_id_care_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."care_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_application_id_care_request_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."care_request_applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_family_user_id_users_id_fk" FOREIGN KEY ("family_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "payments_one_open_per_request" ON "payments" USING btree ("request_id") WHERE "payments"."status" = 'en_attente';--> statement-breakpoint
CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_payment_intent_idx" ON "payments" USING btree ("stripe_payment_intent_id");