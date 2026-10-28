ALTER TABLE "bookings" DROP CONSTRAINT "bookings_night_rate_range";--> statement-breakpoint
ALTER TABLE "care_request_applications" DROP CONSTRAINT "care_request_applications_night_rate_range";--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_amount_range";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP CONSTRAINT "professional_profiles_night_rate_range";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "extra_hour_rate_eur" integer;--> statement-breakpoint
ALTER TABLE "care_request_applications" ADD COLUMN "extra_hour_rate_eur" integer;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "extra_hour_rate_eur" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_night_rate_min" CHECK ("bookings"."night_rate_eur" >= 100);--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_extra_hour_rate_min" CHECK ("bookings"."extra_hour_rate_eur" IS NULL OR "bookings"."extra_hour_rate_eur" >= 1);--> statement-breakpoint
ALTER TABLE "care_request_applications" ADD CONSTRAINT "care_request_applications_night_rate_min" CHECK ("care_request_applications"."night_rate_eur" >= 100);--> statement-breakpoint
ALTER TABLE "care_request_applications" ADD CONSTRAINT "care_request_applications_extra_hour_rate_min" CHECK ("care_request_applications"."extra_hour_rate_eur" IS NULL OR "care_request_applications"."extra_hour_rate_eur" >= 1);--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_min" CHECK ("payments"."amount_cents" >= 300);--> statement-breakpoint
-- profil-tarifs (onboarding-retour-1): the night rate starts at 130 €. A profile under it is
-- raised to it before the check. Answers and bookings keep the rate they carry.
UPDATE "professional_profiles" SET "night_rate_eur" = 130, "updated_at" = now()
WHERE "night_rate_eur" < 130;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_night_rate_min" CHECK ("professional_profiles"."night_rate_eur" IS NULL OR "professional_profiles"."night_rate_eur" >= 130);--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_extra_hour_rate_min" CHECK ("professional_profiles"."extra_hour_rate_eur" IS NULL OR "professional_profiles"."extra_hour_rate_eur" >= 1);