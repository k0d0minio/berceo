-- triage/communes-bastogne-refnis: Bastogne and Bertogne merged on 1 January 2025 under the REFNIS
-- code 82039. Every stored 82003 moves to 82039. Data only, idempotent: a second run matches nothing.
-- A professional who already serves 82039 keeps one row, not two: the primary key forbids the copy.
DELETE FROM "professional_communes" AS "old"
WHERE "old"."commune_ins" = '82003'
  AND EXISTS (
    SELECT 1 FROM "professional_communes" AS "kept"
    WHERE "kept"."profile_id" = "old"."profile_id" AND "kept"."commune_ins" = '82039'
  );--> statement-breakpoint
UPDATE "professional_communes" SET "commune_ins" = '82039' WHERE "commune_ins" = '82003';--> statement-breakpoint
UPDATE "family_profiles" SET "commune_ins" = '82039' WHERE "commune_ins" = '82003';--> statement-breakpoint
UPDATE "care_requests" SET "commune_ins" = '82039' WHERE "commune_ins" = '82003';
