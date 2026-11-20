/**
 * Seeds hand-written grammar topics (src/content/topics) and attaches them to
 * every unit: unit i of a level gets that level's topic i (round-robin).
 * Never overwrites a topic or a lesson's topic once set (the admin panel owns them).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { and, asc, eq, isNull } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { curriculumCourses, curriculumLessons, curriculumTopics, curriculumUnits } from "./schema";
import { TOPIC_SEEDS, type TopicSeed } from "../../content/topics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export async function seedTopics(db: Db, topics: TopicSeed[] = TOPIC_SEEDS) {
  if (!topics.length) return { topics: 0, lessons: 0 };
  await db
    .insert(curriculumTopics)
    .values(topics.map((t) => ({ ...t, kind: "grammar", status: "published", videoStatus: "none" })))
    .onConflictDoNothing();
  let lessons = 0;
  const groups = new Map<string, TopicSeed[]>();
  for (const t of topics) groups.set(`${t.language}:${t.level}`, [...(groups.get(`${t.language}:${t.level}`) ?? []), t]);
  for (const [key, list] of groups) {
    const [language, level] = key.split(":");
    const units = await db
      .select({ id: curriculumUnits.id })
      .from(curriculumUnits)
      .innerJoin(curriculumCourses, eq(curriculumCourses.id, curriculumUnits.courseId))
      .where(and(eq(curriculumCourses.language, language), eq(curriculumCourses.level, level)))
      .orderBy(asc(curriculumUnits.position));
    // Hand-written units come first in a course, so they get the level's first topics
    // (e.g. English A1 unit 1 → the verb "to be").
    for (const [i, unit] of units.entries()) {
      const res = await db
        .update(curriculumLessons)
        .set({ topicId: list[i % list.length].id })
        .where(and(eq(curriculumLessons.unitId, unit.id), isNull(curriculumLessons.topicId)))
        .returning({ id: curriculumLessons.id });
      lessons += res.length;
    }
  }
  return { topics: topics.length, lessons };
}

export type FoundVideo = { videoId: string | null; title?: string; channel?: string };

/**
 * Applies videos found by the YouTube workflow (data/videos.json) to topics nobody
 * has touched yet (video_status "none"). An admin can still reject or replace them.
 */
export async function applyTopicVideos(db: Db, file = join(process.cwd(), "data/videos.json")) {
  if (!existsSync(file)) return 0;
  const found = JSON.parse(readFileSync(file, "utf8")) as Record<string, FoundVideo>;
  let n = 0;
  for (const [id, v] of Object.entries(found)) {
    if (!v.videoId || !/^[\w-]{11}$/.test(v.videoId)) continue;
    const title = [v.title, v.channel].filter(Boolean).join(" — ").slice(0, 200) || null;
    const res = await db
      .update(curriculumTopics)
      .set({ videoId: v.videoId, videoTitle: title, videoStatus: "approved", updatedAt: new Date() })
      .where(and(eq(curriculumTopics.id, id), eq(curriculumTopics.videoStatus, "none")))
      .returning({ id: curriculumTopics.id });
    n += res.length;
  }
  return n;
}
