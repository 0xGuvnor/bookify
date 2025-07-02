ALTER TABLE "events" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "meeting_link" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "participants" text NOT NULL;