-- JAM-304: the one-night pass (night_passes), the promotion code and its discount on subscriptions, and the journal's two promotion-code actions.
-- New table and nullable columns only: the code before this migration reads and writes as before.
CREATE TYPE "public"."night_pass_status" AS ENUM('en_attente', 'payee', 'terminee');--> statement-breakpoint
ALTER TYPE "public"."admin_action" ADD VALUE 'code_promo_cree';--> statement-breakpoint
ALTER TYPE "public"."admin_action" ADD VALUE 'code_promo_desactive';--> statement-breakpoint
CREATE TABLE "night_passes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"status" "night_pass_status" DEFAULT 'en_attente' NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_checkout_session_id" text NOT NULL,
	"stripe_payment_intent_id" text,
	"amount_total" integer,
	"promotion_code" text,
	"amount_discount" integer,
	"paid_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "night_passes_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id"),
	CONSTRAINT "night_passes_paid" CHECK (("night_passes"."status" = 'payee') = ("night_passes"."paid_at" IS NOT NULL)),
	CONSTRAINT "night_passes_ended" CHECK (("night_passes"."status" = 'terminee') = ("night_passes"."ended_at" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "promotion_code" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "amount_discount" integer;--> statement-breakpoint
ALTER TABLE "night_passes" ADD CONSTRAINT "night_passes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "night_passes_one_open_checkout_per_family" ON "night_passes" USING btree ("user_id") WHERE "night_passes"."status" = 'en_attente';--> statement-breakpoint
CREATE INDEX "night_passes_user_id_idx" ON "night_passes" USING btree ("user_id");