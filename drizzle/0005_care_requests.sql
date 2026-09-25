CREATE TYPE "public"."baby_age_unit" AS ENUM('semaines', 'mois');--> statement-breakpoint
CREATE TYPE "public"."care_request_children" AS ENUM('un_bebe', 'jumeaux');--> statement-breakpoint
CREATE TYPE "public"."care_request_status" AS ENUM('ouverte', 'annulee');--> statement-breakpoint
CREATE TABLE "care_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_user_id" uuid NOT NULL,
	"status" "care_request_status" DEFAULT 'ouverte' NOT NULL,
	"urgent" boolean NOT NULL,
	"night_date" date NOT NULL,
	"start_time" time NOT NULL,
	"children" "care_request_children" NOT NULL,
	"baby_age_value" smallint NOT NULL,
	"baby_age_unit" "baby_age_unit" NOT NULL,
	"commune_ins" text NOT NULL,
	"postcode" text NOT NULL,
	"locality" text NOT NULL,
	"no_medical_condition_at" timestamp with time zone NOT NULL,
	"digest_sent_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "care_requests_start_time_slot" CHECK ("care_requests"."start_time" BETWEEN '18:00' AND '23:00' AND date_part('minute', "care_requests"."start_time") IN (0, 30) AND date_part('second', "care_requests"."start_time") = 0),
	CONSTRAINT "care_requests_baby_age_range" CHECK (("care_requests"."baby_age_unit" = 'semaines' AND "care_requests"."baby_age_value" BETWEEN 0 AND 12) OR ("care_requests"."baby_age_unit" = 'mois' AND "care_requests"."baby_age_value" BETWEEN 1 AND 24)),
	CONSTRAINT "care_requests_cancelled_at" CHECK (("care_requests"."status" = 'annulee') = ("care_requests"."cancelled_at" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_family_user_id_users_id_fk" FOREIGN KEY ("family_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "care_requests_commune_status_night_idx" ON "care_requests" USING btree ("commune_ins","status","night_date");--> statement-breakpoint
CREATE INDEX "care_requests_family_user_id_idx" ON "care_requests" USING btree ("family_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "care_requests_one_open_per_night" ON "care_requests" USING btree ("family_user_id","night_date") WHERE "care_requests"."status" = 'ouverte';--> statement-breakpoint
CREATE INDEX "care_requests_digest_pending_idx" ON "care_requests" USING btree ("created_at") WHERE "care_requests"."digest_sent_at" IS NULL AND NOT "care_requests"."urgent";