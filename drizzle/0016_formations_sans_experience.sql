ALTER TABLE "professional_profiles" ADD COLUMN "formations_complementaires" text;--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "specialisations";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "experience";--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_formations_length" CHECK ("professional_profiles"."formations_complementaires" IS NULL OR char_length("professional_profiles"."formations_complementaires") <= 300);--> statement-breakpoint
DROP TYPE "public"."experience";