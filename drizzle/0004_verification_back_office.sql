CREATE TYPE "public"."admin_action" AS ENUM('profil_valide', 'complement_demande', 'profil_refuse', 'reglage_etudiantes', 'documents_supprimes');--> statement-breakpoint
CREATE TABLE "admin_journal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"action" "admin_action" NOT NULL,
	"subject_user_id" uuid,
	"subject_name" text,
	"admin_user_id" uuid,
	"admin_name" text,
	"detail" text
);
--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "review_reason" text;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "admin_journal_occurred_at_idx" ON "admin_journal" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "admin_journal_subject_user_id_idx" ON "admin_journal" USING btree ("subject_user_id");--> statement-breakpoint
-- The admin journal is append-only (verification-back-office): no UPDATE, DELETE or TRUNCATE, whoever sends it.
CREATE FUNCTION "admin_journal_refuse_change"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	RAISE EXCEPTION 'admin_journal is append-only: % refused', TG_OP;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "admin_journal_no_update_or_delete" BEFORE UPDATE OR DELETE ON "admin_journal" FOR EACH ROW EXECUTE FUNCTION "admin_journal_refuse_change"();--> statement-breakpoint
CREATE TRIGGER "admin_journal_no_truncate" BEFORE TRUNCATE ON "admin_journal" FOR EACH STATEMENT EXECUTE FUNCTION "admin_journal_refuse_change"();
