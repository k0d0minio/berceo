CREATE TABLE "family_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"commune_ins" text NOT NULL,
	"postcode" text NOT NULL,
	"locality" text NOT NULL,
	"street" text,
	"house_number" text,
	"box" text,
	"context" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "family_profiles_context_length" CHECK (char_length("family_profiles"."context") <= 300)
);
--> statement-breakpoint
ALTER TABLE "family_profiles" ADD CONSTRAINT "family_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "family_profiles_commune_ins_idx" ON "family_profiles" USING btree ("commune_ins");