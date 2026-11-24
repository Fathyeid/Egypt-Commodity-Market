CREATE TABLE IF NOT EXISTS "league_members" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
 "week" text NOT NULL,
 "language" text NOT NULL,
 "alias" text NOT NULL,
 "joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "league_user_week_uq" ON "league_members" ("user_id", "week");
CREATE INDEX IF NOT EXISTS "league_week_language_idx" ON "league_members" ("week", "language");
