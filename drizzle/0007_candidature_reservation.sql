CREATE TYPE "public"."application_status" AS ENUM('en_attente', 'retenue', 'non_retenue', 'retiree');--> statement-breakpoint
ALTER TYPE "public"."care_request_status" ADD VALUE 'attribuee';--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"application_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"family_user_id" uuid NOT NULL,
	"night_date" date NOT NULL,
	"night_rate_eur" integer NOT NULL,
	"confirmed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_request_id_unique" UNIQUE("request_id"),
	CONSTRAINT "bookings_application_id_unique" UNIQUE("application_id"),
	CONSTRAINT "bookings_night_rate_range" CHECK ("bookings"."night_rate_eur" BETWEEN 100 AND 300)
);
--> statement-breakpoint
CREATE TABLE "care_request_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'en_attente' NOT NULL,
	"night_rate_eur" integer NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answer_count" smallint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "care_request_applications_night_rate_range" CHECK ("care_request_applications"."night_rate_eur" BETWEEN 100 AND 300)
);
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "priority_profile_id" uuid;--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "priority_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "republished_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "republish_count" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_request_id_care_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."care_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_application_id_care_request_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."care_request_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_profile_id_professional_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_family_user_id_users_id_fk" FOREIGN KEY ("family_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_request_applications" ADD CONSTRAINT "care_request_applications_request_id_care_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."care_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_request_applications" ADD CONSTRAINT "care_request_applications_profile_id_professional_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_profile_night_key" ON "bookings" USING btree ("profile_id","night_date");--> statement-breakpoint
CREATE INDEX "bookings_family_night_idx" ON "bookings" USING btree ("family_user_id","night_date");--> statement-breakpoint
CREATE UNIQUE INDEX "care_request_applications_request_profile_key" ON "care_request_applications" USING btree ("request_id","profile_id");--> statement-breakpoint
CREATE INDEX "care_request_applications_profile_status_idx" ON "care_request_applications" USING btree ("profile_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "care_request_applications_one_retenue" ON "care_request_applications" USING btree ("request_id") WHERE "care_request_applications"."status" = 'retenue';--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_priority_profile_id_professional_profiles_id_fk" FOREIGN KEY ("priority_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "care_requests_priority_profile_id_idx" ON "care_requests" USING btree ("priority_profile_id");--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_priority_sent_at" CHECK ("care_requests"."priority_profile_id" IS NULL OR "care_requests"."priority_sent_at" IS NOT NULL);