CREATE TABLE "curriculum_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"level" text NOT NULL,
	"title" jsonb NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"unit_id" text NOT NULL,
	"position" integer NOT NULL,
	"title" jsonb NOT NULL,
	"goal" jsonb NOT NULL,
	"topic_id" text,
	"content" jsonb NOT NULL,
	"source" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"attribution" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"level" text NOT NULL,
	"kind" text NOT NULL,
	"title" jsonb NOT NULL,
	"explanation" jsonb,
	"video_id" text,
	"video_title" text,
	"video_status" text DEFAULT 'none' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_units" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"position" integer NOT NULL,
	"title" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD CONSTRAINT "curriculum_lessons_course_id_curriculum_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."curriculum_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD CONSTRAINT "curriculum_lessons_unit_id_curriculum_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."curriculum_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD CONSTRAINT "curriculum_lessons_topic_id_curriculum_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."curriculum_topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_units" ADD CONSTRAINT "curriculum_units_course_id_curriculum_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."curriculum_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lessons_course_pos_idx" ON "curriculum_lessons" USING btree ("course_id","position");--> statement-breakpoint
CREATE INDEX "lessons_status_idx" ON "curriculum_lessons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "topics_lang_level_idx" ON "curriculum_topics" USING btree ("language","level");--> statement-breakpoint
CREATE INDEX "units_course_idx" ON "curriculum_units" USING btree ("course_id","position");