/**
 * Unit checkpoints: a short test drawn from the quizzes of a unit's lessons,
 * graded on the server. Passing (70%+) is stored as progress "checkpoint:<unitId>".
 */
import { and, eq, inArray, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { activityEvents, lessonProgress } from "@/lib/db/schema";
import { gradeExercise, toPublicExercise, type ExerciseAnswer } from "@/content";
import type { Exercise, Lesson } from "@/content/types";
import { unitLessons } from "@/lib/curriculum";
import { getActiveTrack, DomainError } from "./repo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export const CHECKPOINT_SIZE = 10;
export const PASS_SCORE = 70;
export const checkpointKey = (unitId: string) => `checkpoint:${unitId}`;

/** One question per lesson (cycling through quiz items) until CHECKPOINT_SIZE; deterministic. */
export function buildCheckpoint(lessons: Lesson[]): Exercise[] {
  const out: Exercise[] = [];
  for (let round = 0; out.length < CHECKPOINT_SIZE && round < 5; round++) {
    for (const [i, l] of lessons.entries()) {
      const q = l.quiz[round];
      if (q && out.length < CHECKPOINT_SIZE) out.push({ ...q, id: `l${i}-${q.id}` } as Exercise);
    }
  }
  return out;
}

async function load(db: Db, userId: string, unitId: string) {
  const unit = await unitLessons(db, unitId);
  if (!unit) throw new DomainError("not_found");
  const track = await getActiveTrack(db, userId);
  if (!track || track.targetLanguage !== unit.language) throw new DomainError("not_found");
  return { unit, track, exercises: buildCheckpoint(unit.lessons) };
}

export async function getCheckpoint(db: Db, userId: string, unitId: string) {
  const { unit, exercises } = await load(db, userId, unitId);
  const [best] = await db
    .select({ bestScore: lessonProgress.bestScore })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, checkpointKey(unitId))));
  return { unit, exercises: exercises.map((e) => toPublicExercise(e, unitId)), bestScore: best?.bestScore ?? null };
}

export async function submitCheckpoint(db: Db, userId: string, unitId: string, answers: Record<string, ExerciseAnswer>) {
  const { unit, track, exercises } = await load(db, userId, unitId);
  const results = exercises.map((q) => ({ id: q.id, ...gradeExercise(q, answers[q.id] ?? "", unit.language) }));
  const correct = results.filter((r) => r.correct).length;
  const score = Math.round((correct / exercises.length) * 100);
  const passed = score >= PASS_SCORE;
  const xp = passed ? 30 + correct * 2 : correct;
  await db.transaction(async (tx) => {
    await tx
      .insert(lessonProgress)
      .values({ userId, lessonId: checkpointKey(unitId), bestScore: score })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: { bestScore: sql`greatest(${lessonProgress.bestScore}, ${score})`, attempts: sql`${lessonProgress.attempts} + 1`, updatedAt: new Date() },
      });
    await tx.insert(activityEvents).values({ userId, trackId: track.id, kind: "checkpoint", durationSeconds: 120, xp });
  });
  return { score, correct, total: exercises.length, passed, xp, results };
}

/** Best checkpoint scores for a set of units. */
export async function checkpointScores(db: Db, userId: string, unitIds: string[]) {
  if (!unitIds.length) return new Map<string, number>();
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId, bestScore: lessonProgress.bestScore })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, unitIds.map(checkpointKey))));
  return new Map(rows.map((r) => [r.lessonId.slice("checkpoint:".length), r.bestScore]));
}
