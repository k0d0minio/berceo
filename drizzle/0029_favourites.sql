CREATE TABLE "favourites" (
	"family_user_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favourites_family_user_id_profile_id_pk" PRIMARY KEY("family_user_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_family_user_id_users_id_fk" FOREIGN KEY ("family_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_profile_id_professional_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favourites_profile_id_idx" ON "favourites" USING btree ("profile_id");