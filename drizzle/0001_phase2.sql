CREATE TABLE "exercise_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"exercise_id" text NOT NULL,
	"tag" text,
	"correct" boolean NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"best_score" smallint NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placement_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"item_id" text NOT NULL,
	"skill" text NOT NULL,
	"level" text NOT NULL,
	"correct" boolean NOT NULL,
	"answer" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placement_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"track_id" uuid NOT NULL,
	"language" text NOT NULL,
	"self_level" "cefr_level" NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"result" jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "skill_levels" (
	"track_id" uuid NOT NULL,
	"skill" text NOT NULL,
	"level" text NOT NULL,
	"source" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_levels_track_id_skill_pk" PRIMARY KEY("track_id","skill")
);
--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_responses" ADD CONSTRAINT "placement_responses_test_id_placement_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."placement_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_tests" ADD CONSTRAINT "placement_tests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_tests" ADD CONSTRAINT "placement_tests_track_id_learning_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."learning_tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_levels" ADD CONSTRAINT "skill_levels_track_id_learning_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."learning_tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_user_time_idx" ON "exercise_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_progress_user_lesson_uq" ON "lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "placement_response_uq" ON "placement_responses" USING btree ("test_id","item_id");--> statement-breakpoint
CREATE INDEX "placement_user_track_idx" ON "placement_tests" USING btree ("user_id","track_id");