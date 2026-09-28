-- reservations-reponse-suspendue (D-148): a profile that left `valide` before reopening withdrew
-- her answers keeps no hidden waiting answer. Data only, idempotent: a second run matches nothing.
UPDATE "care_request_applications" SET "status" = 'retiree', "updated_at" = now()
WHERE "status" = 'en_attente'
  AND "profile_id" IN (SELECT "id" FROM "professional_profiles" WHERE "status" <> 'valide');
