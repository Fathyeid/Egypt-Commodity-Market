/**
 * Curriculum access (database-backed). Learners only ever see published lessons;
 * drafts from the content factory wait for review in the admin panel.
 */
import { and, asc, eq, inArray } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { curriculumCourses, curriculumLessons, curriculumTopics, curriculumUnits } from "@/lib/db/schema";
import type { L10n, Lesson } from "@/content/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export type LessonOutline = { id: string; title: L10n; goal: L10n; position: number };
export type CourseOutline = { id: string; language: string; level: string; title: L10n; units: { id: string; title: L10n; lessons: LessonOutline[] }[] };
export type TopicInfo = { id: string; title: L10n; explanation: L10n | null; videoId: string | null; videoTitle: string | null };

export async function coursesForLanguage(db: Db, language: string): Promise<CourseOutline[]> {
  const courses = await db.select().from(curriculumCourses).where(eq(curriculumCourses.language, language)).orderBy(asc(curriculumCourses.sortOrder));
  if (!courses.length) return [];
  const ids = courses.map((c) => c.id);
  const [units, lessons] = await Promise.all([
    db.select().from(curriculumUnits).where(inArray(curriculumUnits.courseId, ids)).orderBy(asc(curriculumUnits.position)),
    db
      .select({ id: curriculumLessons.id, courseId: curriculumLessons.courseId, unitId: curriculumLessons.unitId, title: curriculumLessons.title, goal: curriculumLessons.goal, position: curriculumLessons.position })
      .from(curriculumLessons)
      .where(and(inArray(curriculumLessons.courseId, ids), eq(curriculumLessons.status, "published")))
      .orderBy(asc(curriculumLessons.position)),
  ]);
  return courses
    .map((c) => ({
      id: c.id,
      language: c.language,
      level: c.level,
      title: c.title as L10n,
      units: units
        .filter((u) => u.courseId === c.id)
        .map((u) => ({
          id: u.id,
          title: u.title as L10n,
          lessons: lessons.filter((l) => l.unitId === u.id).map((l) => ({ id: l.id, title: l.title as L10n, goal: l.goal as L10n, position: l.position })),
        }))
        .filter((u) => u.lessons.length > 0),
    }))
    .filter((c) => c.units.length > 0);
}

export const outlineLessonIds = (c: CourseOutline) => c.units.flatMap((u) => u.lessons.map((l) => l.id));

/** A published lesson with its course outline and topic (explanation + video). */
export async function getLesson(db: Db, lessonId: string, opts: { includeDrafts?: boolean } = {}) {
  const [row] = await db.select().from(curriculumLessons).where(eq(curriculumLessons.id, lessonId));
  if (!row || (!opts.includeDrafts && row.status !== "published")) return null;
  const [course] = await db.select().from(curriculumCourses).where(eq(curriculumCourses.id, row.courseId));
  const [unit] = await db.select().from(curriculumUnits).where(eq(curriculumUnits.id, row.unitId));
  let topic: TopicInfo | null = null;
  if (row.topicId) {
    const [t] = await db.select().from(curriculumTopics).where(eq(curriculumTopics.id, row.topicId));
    if (t) topic = { id: t.id, title: t.title as L10n, explanation: t.status === "published" ? (t.explanation as L10n | null) : null, videoId: t.videoStatus === "approved" ? t.videoId : null, videoTitle: t.videoTitle };
  }
  const content = row.content as Omit<Lesson, "id" | "title" | "goal">;
  const lesson: Lesson = { id: row.id, title: row.title as L10n, goal: row.goal as L10n, ...content };
  return { lesson, language: course.language, level: course.level, courseId: course.id, unitTitle: unit.title as L10n, position: row.position, topic, status: row.status };
}

/** Next published lesson in the same course, by position. */
export async function nextLessonId(db: Db, courseId: string, position: number) {
  const rows = await db
    .select({ id: curriculumLessons.id, position: curriculumLessons.position })
    .from(curriculumLessons)
    .where(and(eq(curriculumLessons.courseId, courseId), eq(curriculumLessons.status, "published")))
    .orderBy(asc(curriculumLessons.position));
  return rows.find((r) => r.position > position)?.id ?? null;
}

/** Vocabulary counts and terms for a set of lessons (dashboard and tutor memory). */
export async function lessonVocabulary(db: Db, ids: string[]) {
  if (!ids.length) return new Map<string, { language: string; terms: string[] }>();
  const rows = await db
    .select({ id: curriculumLessons.id, content: curriculumLessons.content, language: curriculumCourses.language })
    .from(curriculumLessons)
    .innerJoin(curriculumCourses, eq(curriculumCourses.id, curriculumLessons.courseId))
    .where(inArray(curriculumLessons.id, ids));
  return new Map(rows.map((r) => [r.id, { language: r.language, terms: ((r.content as { vocabulary?: { term: string }[] }).vocabulary ?? []).map((v) => v.term) }]));
}
