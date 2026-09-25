CREATE TABLE "professional_availability" (
	"profile_id" uuid NOT NULL,
	"night_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_availability_profile_id_night_date_pk" PRIMARY KEY("profile_id","night_date")
);
--> statement-breakpoint
ALTER TABLE "professional_availability" ADD CONSTRAINT "professional_availability_profile_id_professional_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;