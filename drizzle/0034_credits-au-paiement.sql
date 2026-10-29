-- credits-au-paiement: a family's Berceo credit pays her next fee. credit_spends records each take of a credit by a fee (reservee, confirmee, liberee).
-- payments.credit_cents is the part a credit paid. A fee a credit pays whole has no Stripe session. Existing rows keep credit_cents 0 and their session, so both checks hold.
CREATE TYPE "public"."credit_spend_status" AS ENUM('reservee', 'confirmee', 'liberee');--> statement-breakpoint
CREATE TABLE "credit_spends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credit_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"cents" integer NOT NULL,
	"status" "credit_spend_status" DEFAULT 'reservee' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_spends_cents_positive" CHECK ("credit_spends"."cents" > 0)
);
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "stripe_session_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "credit_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_spends" ADD CONSTRAINT "credit_spends_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_spends" ADD CONSTRAINT "credit_spends_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "credit_spends_credit_payment_key" ON "credit_spends" USING btree ("credit_id","payment_id");--> statement-breakpoint
CREATE INDEX "credit_spends_payment_id_idx" ON "credit_spends" USING btree ("payment_id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_credit_range" CHECK ("payments"."credit_cents" >= 0 AND ("payments"."credit_cents" = "payments"."amount_cents" OR "payments"."amount_cents" - "payments"."credit_cents" >= 50));--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_session_or_credit" CHECK (("payments"."stripe_session_id" IS NULL) = ("payments"."credit_cents" = "payments"."amount_cents"));