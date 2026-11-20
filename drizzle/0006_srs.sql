ALTER TABLE "saved_words" ADD COLUMN "due_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_words" ADD COLUMN "interval_days" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_words" ADD COLUMN "ease" real DEFAULT 2.5 NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_words" ADD COLUMN "reps" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_words" ADD COLUMN "lapses" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_words" ADD COLUMN "last_reviewed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "saved_words_due_idx" ON "saved_words" USING btree ("user_id","language","due_at");