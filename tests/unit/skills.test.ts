import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import * as repo from "@/lib/learner/repo";
import * as skills from "@/lib/learner/skills";
import * as study from "@/lib/learner/study";

const sql = postgres(process.env.DATABASE_URL!, { max: 2, onnotice: () => {} });
const db = drizzle(sql, { schema });

async function learner(id: string, target = "en") {
  await db.insert(schema.user).values({ id, name: id, email: `${id}@test.local` });
  await repo.completeOnboarding(db, id, { nativeLanguage: "ar", targetLanguage: target, goal: "work", dailyMinutes: 15, selfLevel: "A2" }, "ar");
  return id;
}

beforeEach(async () => {
  process.env.AI_PROVIDER = "fake";
  await sql`truncate "user", activity_events, learning_tracks, profiles, exercise_attempts, lesson_progress, saved_words, writing_submissions, pron_attempts, error_log, ai_usage, conversations cascade`;
});
afterEach(() => {
  delete process.env.AI_PROVIDER;
});
afterAll(async () => {
  await sql.end();
});

describe("listening & reading", () => {
  it("grades answers on the server, keeps best score and logs activity", async () => {
    const a = await learner("alice");
    const r = await skills.submitTextAnswers(db, a, "en-l-cafe", { q1: 1, q2: 2, q3: 1 });
    expect(r).toMatchObject({ correct: 2, total: 3, score: 67 });
    expect(r.results[2]).toMatchObject({ correct: false, expected: "$5" });
    await skills.submitTextAnswers(db, a, "en-l-cafe", { q1: 1, q2: 2, q3: 0 });
    expect((await study.getProgress(db, a, ["text:en-l-cafe"])).get("text:en-l-cafe")).toBe(100);
    expect((await repo.getDashboardStats(db, a, null)).totalXp).toBeGreaterThan(0);
  });

  it("refuses texts outside the active language", async () => {
    const a = await learner("alice", "en");
    await expect(skills.submitTextAnswers(db, a, "de-l-baeckerei", {})).rejects.toThrow("not_found");
  });
});

describe("saved words", () => {
  it("saves once (case-insensitive), only in the active language, and deletes only your own", async () => {
    const a = await learner("alice");
    const b = await learner("bob");
    await skills.saveWord(db, a, { language: "en", term: "Pharmacy", meaning: "صيدلية", source: "en-l-directions" });
    await skills.saveWord(db, a, { language: "en", term: "pharmacy", meaning: null, source: "x" });
    const words = await skills.listSavedWords(db, a, "en");
    expect(words.map((w) => w.term)).toEqual(["pharmacy"]);
    await expect(skills.saveWord(db, a, { language: "de", term: "Brot", meaning: null, source: "x" })).rejects.toThrow("not_found");
    await skills.deleteSavedWord(db, b, words[0].id);
    expect(await skills.listSavedWords(db, a, "en")).toHaveLength(1);
    await skills.deleteSavedWord(db, a, words[0].id);
    expect(await skills.listSavedWords(db, a, "en")).toHaveLength(0);
  });
});

describe("writing assistant", () => {
  it("is honestly unavailable without an AI key", async () => {
    delete process.env.AI_PROVIDER;
    delete process.env.ANTHROPIC_API_KEY;
    const a = await learner("alice");
    await expect(skills.submitWriting(db, a, "w-intro", "Hello, my name is Ali and I has a cat.", "ar")).rejects.toMatchObject({ code: "not_configured" });
  });

  it("stores feedback, logs errors to the tutor's memory and records usage", async () => {
    const a = await learner("alice");
    const row = await skills.submitWriting(db, a, "w-intro", "Hello, my name is Ali and I has a cat.", "ar");
    const got = await skills.getWriting(db, a, row.id);
    expect(got.feedback.corrected_text).toContain("I have a cat");
    const errs = await db.select().from(schema.errorLog).where(eq(schema.errorLog.userId, a));
    expect(errs[0]).toMatchObject({ source: "writing", ruleTag: "have-has" });
    expect(await db.select().from(schema.aiUsage)).toHaveLength(1);
    const b = await learner("bob");
    await expect(skills.getWriting(db, b, row.id)).rejects.toThrow("not_found");
  });

  it("rejects unknown tasks and near-empty texts", async () => {
    const a = await learner("alice");
    await expect(skills.submitWriting(db, a, "nope", "one two three four five six", "ar")).rejects.toThrow("not_found");
    await expect(skills.submitWriting(db, a, "w-intro", "too short", "ar")).rejects.toBeTruthy();
  });
});

describe("pronunciation attempts", () => {
  it("stores provider scores verbatim and prices Azure audio", async () => {
    const a = await learner("alice");
    const track = (await repo.getActiveTrack(db, a))!;
    const result = { recognized: "Hello", scores: { accuracy: 80, fluency: 70, completeness: 100, pronunciation: 78, prosody: null }, words: [] };
    await skills.recordPronAttempt(db, a, { trackId: track.id, referenceText: "Hello", locale: "en-US", provider: "azure", result, seconds: 3.6 });
    const [usage] = await db.select().from(schema.aiUsage);
    expect(usage).toMatchObject({ feature: "pronunciation", model: "azure-speech:en-US", costMicros: 1001 });
    const hist = await skills.pronHistory(db, a, track.id);
    expect(hist[0].scores).toEqual(result.scores);
  });
});
