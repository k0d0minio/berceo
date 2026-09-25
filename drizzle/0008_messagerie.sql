CREATE TYPE "public"."berceo_message" AS ENUM('amorce', 'bonne_garde');--> statement-breakpoint
CREATE TYPE "public"."message_author" AS ENUM('berceo', 'famille', 'professionnelle');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"request_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"family_user_id" uuid NOT NULL,
	"family_last_read_at" timestamp with time zone,
	"professional_last_read_at" timestamp with time zone,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"author" "message_author" NOT NULL,
	"body" text,
	"berceo_key" "berceo_message",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_berceo_key" CHECK (("messages"."author" = 'berceo') = ("messages"."berceo_key" IS NOT NULL)),
	CONSTRAINT "messages_body_or_key" CHECK (("messages"."body" IS NULL) = ("messages"."berceo_key" IS NOT NULL)),
	CONSTRAINT "messages_body_length" CHECK ("messages"."body" IS NULL OR char_length("messages"."body") BETWEEN 1 AND 2000)
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_application_id_care_request_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."care_request_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_request_id_care_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."care_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_profile_id_professional_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_family_user_id_users_id_fk" FOREIGN KEY ("family_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_family_last_message_idx" ON "conversations" USING btree ("family_user_id","last_message_at");--> statement-breakpoint
CREATE INDEX "conversations_profile_last_message_idx" ON "conversations" USING btree ("profile_id","last_message_at");--> statement-breakpoint
CREATE INDEX "conversations_request_id_idx" ON "conversations" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "messages_one_berceo_key" ON "messages" USING btree ("conversation_id","berceo_key") WHERE "messages"."berceo_key" IS NOT NULL;--> statement-breakpoint
-- The answers made before this migration each get their conversation, with Berceo's amorce dated at the answer.
INSERT INTO "conversations" ("application_id", "request_id", "profile_id", "family_user_id", "last_message_at", "created_at", "updated_at")
SELECT a."id", a."request_id", a."profile_id", r."family_user_id", a."answered_at", a."created_at", a."answered_at"
FROM "care_request_applications" a
JOIN "care_requests" r ON r."id" = a."request_id"
WHERE NOT EXISTS (SELECT 1 FROM "conversations" c WHERE c."application_id" = a."id");--> statement-breakpoint
INSERT INTO "messages" ("conversation_id", "author", "berceo_key", "created_at")
SELECT c."id", 'berceo', 'amorce', a."answered_at"
FROM "conversations" c
JOIN "care_request_applications" a ON a."id" = c."application_id"
ON CONFLICT DO NOTHING;--> statement-breakpoint
-- And each booking made before it, Berceo's « excellente garde » dated at the confirmation.
INSERT INTO "messages" ("conversation_id", "author", "berceo_key", "created_at")
SELECT c."id", 'berceo', 'bonne_garde', b."confirmed_at"
FROM "bookings" b
JOIN "conversations" c ON c."application_id" = b."application_id"
ON CONFLICT DO NOTHING;--> statement-breakpoint
UPDATE "conversations" c
SET "last_message_at" = b."confirmed_at"
FROM "bookings" b
WHERE b."application_id" = c."application_id" AND b."confirmed_at" > c."last_message_at";
