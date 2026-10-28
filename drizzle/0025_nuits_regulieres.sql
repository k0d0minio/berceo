ALTER TABLE "care_requests" ADD COLUMN "series_id" uuid;--> statement-breakpoint
CREATE INDEX "care_requests_series_id_idx" ON "care_requests" USING btree ("series_id");