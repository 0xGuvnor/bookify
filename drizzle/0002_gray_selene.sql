CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"event_owner_id" text NOT NULL,
	"booker_name" text NOT NULL,
	"booker_email" text NOT NULL,
	"booker_notes" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"google_calendar_event_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bookings_event_id" ON "bookings" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_event_owner_id" ON "bookings" USING btree ("event_owner_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_booker_email" ON "bookings" USING btree ("booker_email");--> statement-breakpoint
CREATE INDEX "idx_bookings_start_time" ON "bookings" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_bookings_status" ON "bookings" USING btree ("status");