CREATE TYPE "public"."declaration" AS ENUM('documents_authentiques', 'autorisee_a_exercer', 'fausse_declaration', 'verifications', 'casier_judiciaire');--> statement-breakpoint
CREATE TYPE "public"."document_kind" AS ENUM('diplome', 'attestation_inscription', 'photo');--> statement-breakpoint
CREATE TYPE "public"."experience" AS ENUM('moins_d_un_an', 'un_a_trois_ans', 'trois_a_cinq_ans', 'plus_de_cinq_ans');--> statement-breakpoint
CREATE TYPE "public"."profession" AS ENUM('sage_femme', 'infirmiere_neonatologie', 'puericultrice', 'etudiante_sage_femme');--> statement-breakpoint
CREATE TYPE "public"."profile_status" AS ENUM('brouillon', 'en_attente', 'complement_demande', 'valide', 'refuse');--> statement-breakpoint
CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "professional_communes" (
	"profile_id" uuid NOT NULL,
	"nis_code" text NOT NULL,
	CONSTRAINT "professional_communes_profile_id_nis_code_pk" PRIMARY KEY("profile_id","nis_code")
);
--> statement-breakpoint
CREATE TABLE "professional_declarations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"declaration" "declaration" NOT NULL,
	"version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"kind" "document_kind" NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_documents_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "professional_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "profile_status" DEFAULT 'brouillon' NOT NULL,
	"profession" "profession",
	"specialisations" text[] DEFAULT '{}'::text[] NOT NULL,
	"experience" "experience",
	"night_rate_eur" integer,
	"bio" text,
	"inami_number" text,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "professional_profiles_night_rate_range" CHECK ("professional_profiles"."night_rate_eur" IS NULL OR ("professional_profiles"."night_rate_eur" BETWEEN 100 AND 300)),
	CONSTRAINT "professional_profiles_bio_length" CHECK ("professional_profiles"."bio" IS NULL OR char_length("professional_profiles"."bio") <= 500),
	CONSTRAINT "professional_profiles_inami_format" CHECK ("professional_profiles"."inami_number" IS NULL OR "professional_profiles"."inami_number" ~ '^[0-9]{11}$')
);
--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_communes" ADD CONSTRAINT "professional_communes_profile_id_professional_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_declarations" ADD CONSTRAINT "professional_declarations_profile_id_professional_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_documents" ADD CONSTRAINT "professional_documents_profile_id_professional_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "professional_communes_nis_code_idx" ON "professional_communes" USING btree ("nis_code");--> statement-breakpoint
CREATE INDEX "professional_declarations_profile_id_idx" ON "professional_declarations" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "professional_documents_profile_id_idx" ON "professional_documents" USING btree ("profile_id");