-- JAM-302: a regular request is one request. care_requests.series_whole marks the series published from now on: one professional answers all its nights, one Checkout pays their fees.
-- Existing series keep series_whole false and stay night by night (Q3). The nights of one Checkout share its session: one fee row per night, so stripe_session_id is no longer unique.
ALTER TABLE "payments" DROP CONSTRAINT "payments_stripe_session_id_unique";--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "series_whole" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "payments_stripe_session_idx" ON "payments" USING btree ("stripe_session_id");--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_series_whole" CHECK (NOT "care_requests"."series_whole" OR "care_requests"."series_id" IS NOT NULL);