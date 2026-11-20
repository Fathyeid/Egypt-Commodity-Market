/**
 * Admin access and curriculum review. Admins are listed by email in the
 * ADMIN_EMAILS environment variable (comma-separated); there is no admin by default.
 */
import { and, asc, count, eq, inArray, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { curriculumCourses, curriculumLessons, curriculumTopics, curriculumUnits } from "@/lib/db/schema";
import type { L10n } from "@/content/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export const LESSON_STATUSES = ["draft", "published", "rejected"] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];
export const VIDEO_STATUSES = ["none", "suggested", "approved", "rejected"] as const;
export const PAGE_SIZE = 50;

export function adminEmails(env: Record<string, string | undefined> = process.env): string[] {
  return (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
export const isAdminEmail = (email: string | null | undefined, env?: Record<string, string | undefined>) =>
  !!email && adminEmails(env).includes(email.toLowerCase());

export type CourseStat = { id: string; language: string; level: string; title: L10n; draft: number; published: number; rejected: number };

export async function courseStats(db: Db): Promise<CourseStat[]> {
  const [courses, counts] = await Promise.all([
    db.select().from(curriculumCourses).orderBy(asc(curriculumCourses.language), asc(curriculumCourses.sortOrder), asc(curriculumCourses.id)),
    db.select({ courseId: curriculumLessons.courseId, status: curriculumLessons.status, n: count() }).from(curriculumLessons).groupBy(curriculumLessons.courseId, curriculumLessons.status),
  ]);
  return courses.map((c) => {
    const of = (s: string) => counts.find((x) => x.courseId === c.id && x.status === s)?.n ?? 0;
    return { id: c.id, language: c.language, level: c.level, title: c.title as L10n, draft: of("draft"), published: of("published"), rejected: of("rejected") };
  });
}

export async function courseLessons(db: Db, courseId: string, status: LessonStatus | "all", page: number) {
  const where = status === "all" ? eq(curriculumLessons.courseId, courseId) : and(eq(curriculumLessons.courseId, courseId), eq(curriculumLessons.status, status));
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ id: curriculumLessons.id, title: curriculumLessons.title, status: curriculumLessons.status, source: curriculumLessons.source, position: curriculumLessons.position, unitTitle: curriculumUnits.title, topicId: curriculumLessons.topicId })
      .from(curriculumLessons)
      .innerJoin(curriculumUnits, eq(curriculumUnits.id, curriculumLessons.unitId))
      .where(where)
      .orderBy(asc(curriculumLessons.position))
      .limit(PAGE_SIZE)
      .offset(Math.max(0, page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(curriculumLessons).where(where),
  ]);
  return { rows: rows.map((r) => ({ ...r, title: r.title as L10n, unitTitle: r.unitTitle as L10n })), total };
}

export async function setLessonStatus(db: Db, ids: string[], status: LessonStatus) {
  if (!ids.length) return 0;
  const res = await db.update(curriculumLessons).set({ status, updatedAt: new Date() }).where(inArray(curriculumLessons.id, ids)).returning({ id: curriculumLessons.id });
  return res.length;
}

/** Bulk review: move every lesson of a course from one status to another. */
export async function setCourseStatus(db: Db, courseId: string, from: LessonStatus, to: LessonStatus) {
  const res = await db
    .update(curriculumLessons)
    .set({ status: to, updatedAt: new Date() })
    .where(and(eq(curriculumLessons.courseId, courseId), eq(curriculumLessons.status, from)))
    .returning({ id: curriculumLessons.id });
  return res.length;
}

/* ------------------------------ topics & videos ------------------------------ */

/** Accepts a YouTube URL (watch, youtu.be, shorts, embed) or a bare 11-character id. */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1] ?? null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export type TopicInput = {
  id: string;
  language: string;
  level: string;
  kind: string;
  title: L10n;
  explanation: L10n | null;
  videoId: string | null;
  videoTitle: string | null;
  videoStatus: (typeof VIDEO_STATUSES)[number];
  status: "draft" | "published";
};

export async function listTopics(db: Db, language?: string) {
  const q = db.select().from(curriculumTopics);
  const rows = await (language ? q.where(eq(curriculumTopics.language, language)) : q).orderBy(asc(curriculumTopics.language), asc(curriculumTopics.level), asc(curriculumTopics.id));
  const linked = await db.select({ topicId: curriculumLessons.topicId, n: count() }).from(curriculumLessons).where(sql`${curriculumLessons.topicId} is not null`).groupBy(curriculumLessons.topicId);
  return rows.map((r) => ({ ...r, title: r.title as L10n, explanation: r.explanation as L10n | null, lessons: linked.find((l) => l.topicId === r.id)?.n ?? 0 }));
}

export async function getTopic(db: Db, id: string) {
  const [r] = await db.select().from(curriculumTopics).where(eq(curriculumTopics.id, id));
  return r ? { ...r, title: r.title as L10n, explanation: r.explanation as L10n | null } : null;
}

export async function saveTopic(db: Db, t: TopicInput) {
  const values = { ...t, updatedAt: new Date() };
  await db.insert(curriculumTopics).values(values).onConflictDoUpdate({ target: curriculumTopics.id, set: values });
}

/** Attach a topic (its explanation and video) to every lesson of a unit. */
export async function linkTopicToUnit(db: Db, topicId: string, unitId: string) {
  const res = await db.update(curriculumLessons).set({ topicId, updatedAt: new Date() }).where(eq(curriculumLessons.unitId, unitId)).returning({ id: curriculumLessons.id });
  return res.length;
}

export async function unitsForLanguage(db: Db, language: string) {
  const rows = await db
    .select({ id: curriculumUnits.id, title: curriculumUnits.title, level: curriculumCourses.level })
    .from(curriculumUnits)
    .innerJoin(curriculumCourses, eq(curriculumCourses.id, curriculumUnits.courseId))
    .where(eq(curriculumCourses.language, language))
    .orderBy(asc(curriculumCourses.sortOrder), asc(curriculumUnits.position));
  return rows.map((r) => ({ ...r, title: r.title as L10n }));
}
