CREATE TABLE "content_imports" (
	"source" text PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"lessons" integer NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
