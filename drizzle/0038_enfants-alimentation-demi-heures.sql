-- JAM-303: several children with their own ages, several feedings, extra hours by half hours.
-- The new enum value is only added here. Postgres refuses a new enum value in the
-- transaction that adds it, so no statement below reads or writes 'diversification_alimentaire'.
ALTER TYPE "public"."feeding" ADD VALUE 'diversification_alimentaire';--> statement-breakpoint
ALTER TABLE "care_requests" DROP CONSTRAINT "care_requests_baby_age_range";--> statement-breakpoint
ALTER TABLE "care_requests" DROP CONSTRAINT "care_requests_extra_hours_range";--> statement-breakpoint
-- Whole hours keep their value: 2 becomes 2.0.
ALTER TABLE "care_requests" ALTER COLUMN "extra_hours" SET DATA TYPE numeric(3, 1);--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "child_ages" jsonb;--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "feedings" "feeding"[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
-- Each existing request keeps its values: one child, twins or triplets become 1, 2 or 3
-- children of the stored age, and the one feeding becomes a list of one. A request
-- published before the feeding was asked keeps an empty list.
UPDATE "care_requests" SET
  "child_ages" = (
    SELECT jsonb_agg(jsonb_build_object('value', "care_requests"."baby_age_value", 'unit', "care_requests"."baby_age_unit"))
    FROM generate_series(1, CASE "care_requests"."children" WHEN 'un_bebe' THEN 1 WHEN 'jumeaux' THEN 2 ELSE 3 END)
  ),
  "feedings" = CASE WHEN "care_requests"."feeding" IS NULL THEN '{}'::"feeding"[] ELSE ARRAY["care_requests"."feeding"] END;--> statement-breakpoint
ALTER TABLE "care_requests" ALTER COLUMN "child_ages" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "care_requests" DROP COLUMN "children";--> statement-breakpoint
ALTER TABLE "care_requests" DROP COLUMN "baby_age_value";--> statement-breakpoint
ALTER TABLE "care_requests" DROP COLUMN "baby_age_unit";--> statement-breakpoint
ALTER TABLE "care_requests" DROP COLUMN "feeding";--> statement-breakpoint
DROP TYPE "public"."baby_age_unit";--> statement-breakpoint
DROP TYPE "public"."care_request_children";--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_child_ages_count" CHECK (jsonb_typeof("care_requests"."child_ages") = 'array' AND jsonb_array_length("care_requests"."child_ages") BETWEEN 1 AND 4);--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_extra_hours_range" CHECK ("care_requests"."extra_hours" BETWEEN 0 AND 6 AND "care_requests"."extra_hours" * 2 = trunc("care_requests"."extra_hours" * 2));
