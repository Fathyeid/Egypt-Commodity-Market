/**
 * Spaced repetition (SM-2 variant) for the learner's words, plus XP levels and
 * badges. Everything is computed from real activity; nothing is invented.
 */
import { and, asc, count, eq, gte, lte, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { activityEvents, lessonProgress, savedWords } from "@/lib/db/schema";
import { getActiveTrack, DomainError } from "./repo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export const GRADES = ["again", "hard", "good", "easy"] as const;
export type Grade = (typeof GRADES)[number];
export type CardState = { intervalDays: number; ease: number; reps: number; lapses: number };

const DAY = 24 * 3600 * 1000;
const MIN_EASE = 1.3;

/** Next schedule for a card. "again" brings it back in 10 minutes. */
export function schedule(card: CardState, grade: Grade, now = new Date()): CardState & { dueAt: Date } {
  let { intervalDays, ease, reps, lapses } = card;
  if (grade === "again") {
    lapses += 1;
    reps = 0;
    ease = Math.max(MIN_EASE, ease - 0.2);
    intervalDays = 0;
    return { intervalDays, ease, reps, lapses, dueAt: new Date(now.getTime() + 10 * 60 * 1000) };
  }
  const q = grade === "hard" ? 3 : grade === "good" ? 4 : 5;
  ease = Math.max(MIN_EASE, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  if (reps === 0) intervalDays = grade === "easy" ? 4 : grade === "good" ? 1 : 0.5;
  else if (reps === 1) intervalDays = grade === "easy" ? 7 : grade === "good" ? 3 : 1.5;
  else intervalDays = Math.max(1, intervalDays * (grade === "hard" ? 1.2 : grade === "easy" ? ease * 1.3 : ease));
  intervalDays = Math.min(365, Math.round(intervalDays * 10) / 10);
  reps += 1;
  return { intervalDays, ease: Math.round(ease * 100) / 100, reps, lapses, dueAt: new Date(now.getTime() + intervalDays * DAY) };
}

/** A word counts as "learned" once it has survived at least a one-day interval. */
export const LEARNED_INTERVAL = 1;

export async function dueWords(db: Db, userId: string, language: string, limit = 20, now = new Date()) {
  return db
    .select({ id: savedWords.id, term: savedWords.term, meaning: savedWords.meaning, reps: savedWords.reps })
    .from(savedWords)
    .where(and(eq(savedWords.userId, userId), eq(savedWords.language, language), lte(savedWords.dueAt, now)))
    .orderBy(asc(savedWords.dueAt))
    .limit(limit);
}

export async function wordCounts(db: Db, userId: string, language: string, now = new Date()) {
  const [row] = await db
    .select({
      total: count(),
      due: sql<number>`count(*) filter (where ${savedWords.dueAt} <= ${now.toISOString()}::timestamptz)::int`,
      learned: sql<number>`count(*) filter (where ${savedWords.intervalDays} >= ${LEARNED_INTERVAL})::int`,
    })
    .from(savedWords)
    .where(and(eq(savedWords.userId, userId), eq(savedWords.language, language)));
  return { total: row?.total ?? 0, due: row?.due ?? 0, learned: row?.learned ?? 0 };
}

export async function reviewWord(db: Db, userId: string, id: string, grade: Grade, now = new Date()) {
  const [card] = await db.select().from(savedWords).where(and(eq(savedWords.id, id), eq(savedWords.userId, userId)));
  if (!card) throw new DomainError("not_found");
  const next = schedule(card, grade, now);
  const track = await getActiveTrack(db, userId);
  await db.transaction(async (tx) => {
    await tx.update(savedWords).set({ ...next, lastReviewedAt: now }).where(eq(savedWords.id, id));
    await tx.insert(activityEvents).values({ userId, trackId: track?.id ?? null, kind: "review", durationSeconds: 8, xp: grade === "again" ? 1 : 2 });
  });
  return next;
}

/** Adds a completed lesson's vocabulary to the learner's review deck (no duplicates). */
export async function addLessonWords(db: Db, userId: string, language: string, lessonId: string, items: { term: string; meaning: string }[]) {
  const rows = items
    .map((v) => ({ term: v.term.trim().toLowerCase().slice(0, 80), meaning: v.meaning.slice(0, 200) }))
    .filter((v) => v.term)
    .map((v) => ({ userId, language, term: v.term, meaning: v.meaning, source: `lesson:${lessonId}`.slice(0, 60) }));
  if (rows.length) await db.insert(savedWords).values(rows).onConflictDoNothing();
}

/* ------------------------------ XP levels ------------------------------ */

/** Level n needs 50·n·(n−1) XP in total: 0, 100, 300, 600, 1000… */
export function levelFromXp(xp: number) {
  let level = 1;
  while (50 * (level + 1) * level <= xp) level++;
  const floor = 50 * level * (level - 1);
  const next = 50 * (level + 1) * level;
  return { level, xpIntoLevel: xp - floor, xpForNext: next - floor };
}

/* ------------------------------- Badges -------------------------------- */

export type BadgeId =
  | "first_lesson" | "lessons_10" | "lessons_50" | "lessons_200"
  | "streak_3" | "streak_7" | "streak_30"
  | "words_25" | "words_100" | "words_500"
  | "xp_1000" | "xp_10000";

export const BADGES: { id: BadgeId; metric: "lessons" | "streak" | "words" | "xp"; at: number }[] = [
  { id: "first_lesson", metric: "lessons", at: 1 },
  { id: "lessons_10", metric: "lessons", at: 10 },
  { id: "lessons_50", metric: "lessons", at: 50 },
  { id: "lessons_200", metric: "lessons", at: 200 },
  { id: "streak_3", metric: "streak", at: 3 },
  { id: "streak_7", metric: "streak", at: 7 },
  { id: "streak_30", metric: "streak", at: 30 },
  { id: "words_25", metric: "words", at: 25 },
  { id: "words_100", metric: "words", at: 100 },
  { id: "words_500", metric: "words", at: 500 },
  { id: "xp_1000", metric: "xp", at: 1000 },
  { id: "xp_10000", metric: "xp", at: 10000 },
];

export function earnedBadges(m: { lessons: number; streak: number; words: number; xp: number }) {
  return BADGES.map((b) => ({ ...b, earned: m[b.metric] >= b.at, progress: Math.min(1, m[b.metric] / b.at) }));
}

export async function completedLessonCount(db: Db, userId: string) {
  const [row] = await db.select({ n: count() }).from(lessonProgress).where(and(eq(lessonProgress.userId, userId), sql`${lessonProgress.lessonId} not like 'checkpoint:%'`));
  return row?.n ?? 0;
}

/** Minutes of activity today (UTC) for the daily goal. */
export async function minutesToday(db: Db, userId: string, now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const [row] = await db
    .select({ s: sql<number>`coalesce(sum(${activityEvents.durationSeconds}), 0)::int` })
    .from(activityEvents)
    .where(and(eq(activityEvents.userId, userId), gte(activityEvents.createdAt, start)));
  return Math.round((row?.s ?? 0) / 60);
}
