CREATE TYPE "public"."subscription_plan" AS ENUM('decouverte', 'parenthese', 'serenite', 'premium');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('en_attente', 'active', 'impayee', 'terminee');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"plan" "subscription_plan" NOT NULL,
	"status" "subscription_status" DEFAULT 'en_attente' NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text,
	"stripe_checkout_session_id" text NOT NULL,
	"current_period_end" timestamp with time zone,
	"grace_ends_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id"),
	CONSTRAINT "subscriptions_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id"),
	CONSTRAINT "subscriptions_grace" CHECK (("subscriptions"."status" = 'impayee') = ("subscriptions"."grace_ends_at" IS NOT NULL)),
	CONSTRAINT "subscriptions_period" CHECK ("subscriptions"."status" NOT IN ('active', 'impayee') OR "subscriptions"."current_period_end" IS NOT NULL),
	CONSTRAINT "subscriptions_ended" CHECK (("subscriptions"."status" = 'terminee') = ("subscriptions"."ended_at" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_one_live_per_family" ON "subscriptions" USING btree ("user_id") WHERE "subscriptions"."status" IN ('en_attente', 'active', 'impayee');--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id");