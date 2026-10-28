CREATE TABLE "professional_reach" (
	"profile_id" uuid NOT NULL,
	"commune_ins" text NOT NULL,
	CONSTRAINT "professional_reach_profile_id_commune_ins_pk" PRIMARY KEY("profile_id","commune_ins")
);
--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "zone_radius_km" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "zone_whole_belgium" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_reach" ADD CONSTRAINT "professional_reach_profile_id_professional_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "professional_reach_commune_ins_idx" ON "professional_reach" USING btree ("commune_ins");--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_zone_radius" CHECK ("professional_profiles"."zone_radius_km" IN (0, 10, 20, 30, 40, 50));--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_zone_whole_belgium" CHECK (NOT "professional_profiles"."zone_whole_belgium" OR "professional_profiles"."zone_radius_km" = 0);--> statement-breakpoint
-- profil-zone-rayon-saisie (onboarding-retour-1): every profile starts at 0 km, her communes
-- only. So her reach is her communes, copied once here. Her next save recomputes it.
INSERT INTO "professional_reach" ("profile_id", "commune_ins")
SELECT "profile_id", "commune_ins" FROM "professional_communes";
