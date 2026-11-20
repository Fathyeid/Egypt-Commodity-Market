/**
 * Seeds hand-written grammar topics (src/content/topics) and attaches them to
 * factory units: unit i of a level gets that level's topic i (round-robin).
 * Never overwrites a topic or a lesson's topic once set (the admin panel owns them).
 */
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
    const factoryUnits = units.filter((u) => u.id.includes("-fu-"));
    for (const [i, unit] of factoryUnits.entries()) {
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
