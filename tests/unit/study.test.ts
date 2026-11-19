import { afterAll, beforeEach, describe, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import * as repo from "@/lib/learner/repo";
import * as study from "@/lib/learner/study";
import { getPlacementItem } from "@/content";

const sql = postgres(process.env.DATABASE_URL!, { max: 2, onnotice: () => {} });
const db = drizzle(sql, { schema });
const base = { goal: "travel", dailyMinutes: 15, selfLevel: "A2" } as const;

async function learner(id: string, target = "en") {
  await db.insert(schema.user).values({ id, name: id, email: `${id}@test.local` });
  await repo.completeOnboarding(db, id, { nativeLanguage: "ar", targetLanguage: target, ...base }, "ar");
  return id;
}

beforeEach(async () => {
  await sql`truncate "user", activity_events, learning_tracks, profiles, placement_tests, lesson_progress, exercise_attempts cascade`;
});
afterAll(async () => {
  await sql.end();
});

describe("placement flow", () => {
  it("runs to completion, stores per-skill levels, sets the track level and logs activity", async () => {
    const a = await learner("alice");
    const test = await study.startPlacement(db, a);
    expect((await study.startPlacement(db, a)).id).toBe(test.id); // resumes, doesn't duplicate
    let state = await study.getPlacementState(db, a, test.id);
    let n = 0;
    while (state.next) {
      const item = getPlacementItem("en", state.next.id)!;
      // Correct for A1–B1 items, wrong above → should land on B1.
      const ok = ["A1", "A2", "B1"].includes(item.level);
      await study.answerPlacement(db, a, test.id, item.id, ok ? item.answer : (item.answer + 1) % item.options.length);
      state = await study.getPlacementState(db, a, test.id);
      n++;
    }
    expect(n).toBe(state.total);
    const last = await study.latestPlacement(db, a, test.trackId);
    expect(last?.status).toBe("completed");
    expect(last?.result?.overall).toBe("B1");
    expect((await study.getSkillLevels(db, a, test.trackId)).map((s) => s.level)).toEqual(["B1", "B1", "B1", "B1"]);
    expect((await repo.getActiveTrack(db, a))?.placementLevel).toBe("B1");
    const stats = await repo.getDashboardStats(db, a, test.trackId);
    expect(stats.totalXp).toBe(20);
  });

  it("rejects answering an item other than the expected next one", async () => {
    const a = await learner("alice");
    const test = await study.startPlacement(db, a);
    await expect(study.answerPlacement(db, a, test.id, "en-v-c1-1", 0)).rejects.toThrow("not_found");
  });

  it("another user cannot read or answer someone else's test or skill levels", async () => {
    const a = await learner("alice");
    const b = await learner("bob");
    const test = await study.startPlacement(db, a);
    const state = await study.getPlacementState(db, a, test.id);
    await expect(study.getPlacementState(db, b, test.id)).rejects.toThrow("not_found");
    await expect(study.answerPlacement(db, b, test.id, state.next!.id, 0)).rejects.toThrow("not_found");
    expect(await study.getSkillLevels(db, b, test.trackId)).toEqual([]);
  });

  it("is unavailable for languages without a bank", async () => {
    const a = await learner("alice", "ja");
    await expect(study.startPlacement(db, a)).rejects.toThrow("language_unavailable");
  });
});

describe("lessons", () => {
  it("grades the quiz on the server, keeps the best score and awards XP", async () => {
    const a = await learner("alice");
    const r1 = await study.submitQuiz(db, a, "en-a1-u1-l1", { q1: 2, q2: "is", q3: "I'm Sara", q4: "good morning" }, 300);
    expect(r1).toMatchObject({ score: 100, correct: 4, total: 4, xp: 18 });
    const r2 = await study.submitQuiz(db, a, "en-a1-u1-l1", { q1: 0, q2: "are", q3: "x", q4: "y" }, 9_999_999);
    expect(r2.score).toBe(0);
    const progress = await study.getProgress(db, a, ["en-a1-u1-l1"]);
    expect(progress.get("en-a1-u1-l1")).toBe(100);
    const stats = await repo.getDashboardStats(db, a, null);
    expect(stats.minutesThisWeek).toBe(5 + 60); // second session clamped to 60 min
    const attempts = await db.select().from(schema.exerciseAttempts).where(eq(schema.exerciseAttempts.userId, a));
    expect(attempts).toHaveLength(8);
  });

  it("practice exercises are graded and logged with their grammar tag", async () => {
    const a = await learner("alice");
    const r = await study.checkExercise(db, a, "en-a1-u1-l1", "e1", 0);
    expect(r.correct).toBe(false);
    expect(r.expected).toBe("am");
    const [row] = await db.select().from(schema.exerciseAttempts).where(eq(schema.exerciseAttempts.userId, a));
    expect(row).toMatchObject({ tag: "to-be", correct: false });
  });

  it("refuses lessons outside the learner's active language", async () => {
    const a = await learner("alice", "en");
    await expect(study.submitQuiz(db, a, "de-a1-u1-l1", {}, 10)).rejects.toThrow("not_found");
    await expect(study.checkExercise(db, a, "nope", "e1", 0)).rejects.toThrow("not_found");
  });
});
