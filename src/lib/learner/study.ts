/**
 * Placement tests and lesson progress. Every function is scoped by the
 * authenticated userId; tests/tracks belonging to other users are not_found.
 */
import { addLessonWords } from "./srs";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import {
  activityEvents,
  exerciseAttempts,
  learningTracks,
  lessonProgress,
  placementResponses,
  placementTests,
  skillLevels,
} from "@/lib/db/schema";
import { getPlacementBank, getPlacementItem, gradeExercise, placementAvailable, toPublicItem, type ExerciseAnswer } from "@/content";
import { getLesson } from "@/lib/curriculum";
import { computeResult, nextItem, TOTAL_ITEMS, type PlacementResult, type Response } from "@/lib/placement/engine";
import { DomainError, getActiveTrack } from "./repo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

const MAX_SESSION_SECONDS = 60 * 60;
const clampDuration = (s: number) => Math.max(0, Math.min(MAX_SESSION_SECONDS, Math.round(Number.isFinite(s) ? s : 0)));

/* ----------------------------- Placement ----------------------------- */

async function ownTest(db: Db, userId: string, testId: string) {
  const [t] = await db.select().from(placementTests).where(and(eq(placementTests.id, testId), eq(placementTests.userId, userId)));
  if (!t) throw new DomainError("not_found");
  return t;
}

async function responsesOf(db: Db, testId: string): Promise<Response[]> {
  const rows = await db.select().from(placementResponses).where(eq(placementResponses.testId, testId)).orderBy(placementResponses.createdAt);
  return rows.map((r) => ({ itemId: r.itemId, skill: r.skill as Response["skill"], level: r.level as Response["level"], correct: r.correct }));
}

/** Resume the in-progress test for the active track, or start a new one. */
export async function startPlacement(db: Db, userId: string) {
  const track = await getActiveTrack(db, userId);
  if (!track) throw new DomainError("not_found");
  if (!placementAvailable(track.targetLanguage)) throw new DomainError("language_unavailable");
  const [open] = await db
    .select()
    .from(placementTests)
    .where(and(eq(placementTests.userId, userId), eq(placementTests.trackId, track.id), eq(placementTests.status, "in_progress")));
  if (open) return open;
  const [created] = await db
    .insert(placementTests)
    .values({ userId, trackId: track.id, language: track.targetLanguage, selfLevel: track.selfLevel })
    .returning();
  return created;
}

export async function getPlacementState(db: Db, userId: string, testId: string) {
  const test = await ownTest(db, userId, testId);
  const responses = await responsesOf(db, testId);
  const next = test.status === "in_progress" ? nextItem(getPlacementBank(test.language), responses, test.selfLevel) : null;
  return {
    test,
    answered: responses.length,
    total: TOTAL_ITEMS,
    next: next ? toPublicItem(next) : null,
  };
}

/**
 * Records an answer. The item must be exactly the one the engine expects next,
 * so learners can't skip, repeat or pick items. Finishes the test when done.
 */
export async function answerPlacement(db: Db, userId: string, testId: string, itemId: string, answer: number) {
  const test = await ownTest(db, userId, testId);
  if (test.status !== "in_progress") throw new DomainError("not_found");
  const responses = await responsesOf(db, testId);
  const expected = nextItem(getPlacementBank(test.language), responses, test.selfLevel);
  if (!expected || expected.id !== itemId) throw new DomainError("not_found");
  const item = getPlacementItem(test.language, itemId)!;
  const correct = Number.isInteger(answer) && answer === item.answer;
  await db.insert(placementResponses).values({ testId, itemId, skill: item.skill, level: item.level, correct, answer });
  const all = [...responses, { itemId, skill: item.skill, level: item.level, correct }];
  const following = nextItem(getPlacementBank(test.language), all, test.selfLevel);
  if (!following) {
    await finishPlacement(db, userId, test, all);
    return { done: true as const };
  }
  return { done: false as const };
}

async function finishPlacement(db: Db, userId: string, test: typeof placementTests.$inferSelect, responses: Response[]) {
  const result = computeResult(responses);
  const duration = clampDuration((Date.now() - new Date(test.startedAt).getTime()) / 1000);
  await db.transaction(async (tx) => {
    await tx.update(placementTests).set({ status: "completed", result, completedAt: new Date() }).where(eq(placementTests.id, test.id));
    for (const [skill, v] of Object.entries(result.skills)) {
      if (!v.level) continue;
      await tx
        .insert(skillLevels)
        .values({ trackId: test.trackId, skill, level: v.level, source: "placement" })
        .onConflictDoUpdate({ target: [skillLevels.trackId, skillLevels.skill], set: { level: v.level, source: "placement", updatedAt: new Date() } });
    }
    await tx.update(learningTracks).set({ placementLevel: result.overall }).where(eq(learningTracks.id, test.trackId));
    await tx.insert(activityEvents).values({ userId, trackId: test.trackId, kind: "placement", durationSeconds: duration, xp: 20 });
  });
}

export async function latestPlacement(db: Db, userId: string, trackId: string) {
  const [t] = await db
    .select()
    .from(placementTests)
    .where(and(eq(placementTests.userId, userId), eq(placementTests.trackId, trackId)))
    .orderBy(desc(placementTests.startedAt))
    .limit(1);
  return t ? { ...t, result: t.result as PlacementResult | null } : null;
}

export async function getSkillLevels(db: Db, userId: string, trackId: string) {
  return db
    .select({ skill: skillLevels.skill, level: skillLevels.level, source: skillLevels.source, updatedAt: skillLevels.updatedAt })
    .from(skillLevels)
    .innerJoin(learningTracks, eq(learningTracks.id, skillLevels.trackId))
    .where(and(eq(skillLevels.trackId, trackId), eq(learningTracks.userId, userId)));
}

/* ------------------------------ Lessons ------------------------------ */

/** The lesson must be published and in the user's active track language. */
export async function resolveLesson(db: Db, userId: string, lessonId: string) {
  const [found, track] = await Promise.all([getLesson(db, lessonId), getActiveTrack(db, userId)]);
  if (!found || !track || found.language !== track.targetLanguage) throw new DomainError("not_found");
  return { ...found, track };
}

export async function getProgress(db: Db, userId: string, lessonIdsList: string[]) {
  if (!lessonIdsList.length) return new Map<string, number>();
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId, bestScore: lessonProgress.bestScore })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIdsList)));
  return new Map(rows.map((r) => [r.lessonId, r.bestScore]));
}

/** Grade one practice exercise and log the attempt. */
export async function checkExercise(db: Db, userId: string, lessonId: string, exerciseId: string, answer: ExerciseAnswer) {
  const { lesson, language } = await resolveLesson(db, userId, lessonId);
  const ex = lesson.exercises.find((e) => e.id === exerciseId);
  if (!ex) throw new DomainError("not_found");
  const result = gradeExercise(ex, answer, language);
  await db.insert(exerciseAttempts).values({ userId, lessonId, exerciseId, tag: ex.tag ?? null, correct: result.correct, answer: String(answer).slice(0, 200) });
  return result;
}

/** Grade the whole end-of-lesson quiz on the server, save progress and XP. */
export async function submitQuiz(db: Db, userId: string, lessonId: string, answers: Record<string, ExerciseAnswer>, durationSeconds: number, uiLocale: "ar" | "en" = "ar") {
  const { lesson, language, track } = await resolveLesson(db, userId, lessonId);
  const results = lesson.quiz.map((q) => ({ id: q.id, ...gradeExercise(q, answers[q.id] ?? "", language) }));
  const correct = results.filter((r) => r.correct).length;
  const score = Math.round((correct / lesson.quiz.length) * 100);
  const xp = 10 + correct * 2;
  await db.transaction(async (tx) => {
    await tx.insert(exerciseAttempts).values(
      lesson.quiz.map((q, i) => ({ userId, lessonId, exerciseId: `quiz:${q.id}`, tag: q.tag ?? null, correct: results[i].correct, answer: String(answers[q.id] ?? "").slice(0, 200) })),
    );
    await tx
      .insert(lessonProgress)
      .values({ userId, lessonId, bestScore: score })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: { bestScore: sql`greatest(${lessonProgress.bestScore}, ${score})`, attempts: sql`${lessonProgress.attempts} + 1`, updatedAt: new Date() },
      });
    await tx.insert(activityEvents).values({ userId, trackId: track.id, kind: "lesson", durationSeconds: clampDuration(durationSeconds), xp });
  });
  // The lesson's words join the learner's spaced-repetition deck.
  await addLessonWords(db, userId, language, lessonId, lesson.vocabulary.map((v) => ({ term: v.term, meaning: v.meaning[uiLocale] })));
  return { score, correct, total: lesson.quiz.length, xp, results };
}

export async function countCompletedLessons(db: Db, userId: string, ids: string[]) {
  return (await getProgress(db, userId, ids)).size;
}
