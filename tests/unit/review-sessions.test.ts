import { afterAll, beforeEach, describe, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";
import { completeOnboarding, getActiveTrack, addTrack } from "@/lib/learner/repo";
import { dueWords, reviewWord, wordCounts } from "@/lib/learner/srs";
import { addRecurringMistakeWords } from "@/lib/learner/mistake-review";
import { intervalMinutes, sessionMinutes, sessionSize } from "@/lib/learner/review-policy";

const sql = postgres(process.env.DATABASE_URL!, { max: 8, onnotice: () => {} });
const db = drizzle(sql, { schema });
const now = new Date("2026-11-21T18:00:00.000Z");
async function learner(id = "alice") {
  await db.insert(schema.user).values({ id, name: id, email: `${id}@test.local` });
  await completeOnboarding(db, id, { nativeLanguage: "ar", targetLanguage: "en", goal: "work", dailyMinutes: 15, selfLevel: "A2" }, "ar");
  return (await getActiveTrack(db, id))!;
}
async function card(userId = "alice", language = "en") {
  const [row] = await db.insert(schema.savedWords).values({ userId, language, term: "pharmacy", meaning: "صيدلية", source: "listening", dueAt: now }).returning();
  return row;
}
beforeEach(async () => { await sql`truncate "user" cascade`; });
afterAll(async () => { await sql.end(); });

describe("small review sessions", () => {
  it("accepts only supported budgets and caps the deck", () => {
    expect([2, 5, 10].map(sessionMinutes).map(sessionSize)).toEqual([8, 20, 40]);
    expect(["bogus", -2, 1e9, undefined, [2, 10]].map(sessionMinutes)).toEqual([5, 5, 5, 5, 5]);
    expect(intervalMinutes({ reps: 0, ease: 2.5, intervalDays: 0, lapses: 0 }, "again")).toBe(10);
  });
  it("orders due cards, isolates users/languages, exposes timing without future cards", async () => {
    await learner(); await learner("bob");
    await card(); await card("bob"); await card("alice", "de");
    await db.insert(schema.savedWords).values({ userId: "alice", language: "en", term: "next", source: "test", dueAt: new Date(now.getTime() + 600000), intervalDays: 1 });
    expect(await dueWords(db, "alice", "en", 8, now)).toHaveLength(1);
    expect(await wordCounts(db, "alice", "en", now)).toMatchObject({ total: 2, due: 1, learned: 1, nextDueAt: "2026-11-21T18:10:00.000Z" });
  });
});

describe("atomic due-version rewards", () => {
  it("eight concurrent grades consume a due version once", async () => {
    const track = await learner(); const c = await card();
    const results = await Promise.all(Array.from({ length: 8 }, () => reviewWord(db, "alice", c.id, "good", c.dueAt.toISOString(), now)));
    expect(results.filter((r) => r.accepted)).toHaveLength(1);
    const [saved] = await db.select().from(schema.savedWords);
    expect(saved).toMatchObject({ reps: 1, intervalDays: 1 });
    expect(await db.select().from(schema.activityEvents)).toEqual([expect.objectContaining({ userId: "alice", trackId: track.id, kind: "review", xp: 2 })]);
  });
  it("rejects replay even after the card becomes due again, but accepts a fresh version", async () => {
    await learner(); const c = await card(); const token = c.dueAt.toISOString();
    await reviewWord(db, "alice", c.id, "again", token, now);
    const later = new Date(now.getTime() + 600001);
    expect((await reviewWord(db, "alice", c.id, "easy", token, later)).accepted).toBe(false);
    const [current] = await db.select().from(schema.savedWords);
    expect((await reviewWord(db, "alice", c.id, "good", current.dueAt.toISOString(), later)).accepted).toBe(true);
    expect((await db.select().from(schema.activityEvents)).map((e) => e.xp)).toEqual([1, 2]);
  });
  it("does not reward future cards, another learner, or an inactive language", async () => {
    await learner(); await learner("bob"); const c = await card();
    expect((await reviewWord(db, "alice", c.id, "good", c.dueAt.toISOString(), new Date(now.getTime() - 1))).accepted).toBe(false);
    await expect(reviewWord(db, "bob", c.id, "good", c.dueAt.toISOString(), now)).rejects.toThrow("not_found");
    await addTrack(db, "alice", { targetLanguage: "de", goal: "work", dailyMinutes: 15, selfLevel: "A2" });
    await expect(reviewWord(db, "alice", c.id, "good", c.dueAt.toISOString(), now)).rejects.toThrow("not_found");
    expect(await db.select().from(schema.activityEvents)).toHaveLength(0);
  });
  it("rolls back the schedule if inserting the reward fails", async () => {
    await learner(); const c = await card();
    await sql`alter table activity_events add constraint test_block_review check (kind <> 'review')`;
    try { await expect(reviewWord(db, "alice", c.id, "good", c.dueAt.toISOString(), now)).rejects.toBeTruthy(); }
    finally { await sql`alter table activity_events drop constraint test_block_review`; }
    expect((await db.select().from(schema.savedWords))[0].dueAt.toISOString()).toBe(c.dueAt.toISOString());
  });
});

describe("repeated conversation corrections", () => {
  it("adds repeated pairs only, preserving existing schedules and user/language scope", async () => {
    const a = await learner(); const b = await learner("bob");
    const error = { userId: "alice", trackId: a.id, source: "tutor", category: "grammar", ruleTag: "have-has", original: "I has", corrected: "I have", explanation: "Use have with I", createdAt: now };
    await db.insert(schema.errorLog).values(error);
    await addRecurringMistakeWords(db, "alice", a.id, now);
    expect(await db.select().from(schema.savedWords)).toHaveLength(0);
    await db.insert(schema.errorLog).values({ ...error, source: "roleplay" });
    await addRecurringMistakeWords(db, "alice", a.id, now);
    const [word] = await db.select().from(schema.savedWords);
    expect(word).toMatchObject({ userId: "alice", language: "en", term: "i have", source: "mistake:have-has" });
    await reviewWord(db, "alice", word.id, "good", word.dueAt.toISOString(), now);
    const [before] = await db.select().from(schema.savedWords);
    await addRecurringMistakeWords(db, "alice", a.id, now);
    expect(await db.select().from(schema.savedWords)).toEqual([before]);
    await addRecurringMistakeWords(db, "bob", a.id, now);
    await addRecurringMistakeWords(db, "bob", b.id, now);
    expect(await dueWords(db, "bob", "en", 20, now)).toEqual([]);
  });
  it("ignores old errors, writing-only errors and different correction pairs", async () => {
    const a = await learner();
    const e = { userId: "alice", trackId: a.id, source: "tutor", category: "grammar", ruleTag: "have-has", original: "I has", corrected: "I have", explanation: "Use have", createdAt: now };
    await db.insert(schema.errorLog).values([e, { ...e, corrected: "he has" }, ...[1,2].map(() => ({ ...e, original: "old", createdAt: new Date(now.getTime() - 61 * 86400000) })), ...[1,2].map(() => ({ ...e, original: "writing", source: "writing" }))]);
    await addRecurringMistakeWords(db, "alice", a.id, now);
    expect(await db.select().from(schema.savedWords)).toHaveLength(0);
  });
});
