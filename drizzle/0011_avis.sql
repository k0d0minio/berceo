CREATE TYPE "public"."rating_side" AS ENUM('famille', 'professionnelle');--> statement-breakpoint
CREATE TABLE "rating_invitations" (
	"booking_id" uuid NOT NULL,
	"side" "rating_side" NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	CONSTRAINT "rating_invitations_booking_id_side_pk" PRIMARY KEY("booking_id","side")
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"rater_side" "rating_side" NOT NULL,
	"rater_user_id" uuid NOT NULL,
	"rated_user_id" uuid NOT NULL,
	"score_1" smallint NOT NULL,
	"score_2" smallint NOT NULL,
	"score_3" smallint NOT NULL,
	"score_4" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ratings_score_1" CHECK ("ratings"."score_1" BETWEEN 1 AND 5),
	CONSTRAINT "ratings_score_2" CHECK ("ratings"."score_2" BETWEEN 1 AND 5),
	CONSTRAINT "ratings_score_3" CHECK ("ratings"."score_3" BETWEEN 1 AND 5),
	CONSTRAINT "ratings_score_4" CHECK ("ratings"."score_4" BETWEEN 1 AND 5)
);
--> statement-breakpoint
ALTER TABLE "rating_invitations" ADD CONSTRAINT "rating_invitations_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rater_user_id_users_id_fk" FOREIGN KEY ("rater_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rated_user_id_users_id_fk" FOREIGN KEY ("rated_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_booking_side_key" ON "ratings" USING btree ("booking_id","rater_side");--> statement-breakpoint
CREATE INDEX "ratings_rated_user_idx" ON "ratings" USING btree ("rated_user_id");--> statement-breakpoint
CREATE INDEX "ratings_created_idx" ON "ratings" USING btree ("created_at");