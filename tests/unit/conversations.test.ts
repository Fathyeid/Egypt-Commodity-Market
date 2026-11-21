import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import * as repo from "@/lib/learner/repo";
import * as convo from "@/lib/learner/conversations";
import * as study from "@/lib/learner/study";
import { buildMemory } from "@/lib/learner/memory";
import { tutorSystem } from "@/lib/ai/prompts";
import { costMicros } from "@/lib/ai/pricing";
import { checkLimits } from "@/lib/ai/limits";

const sql = postgres(process.env.DATABASE_URL!, { max: 2, onnotice: () => {} });
const db = drizzle(sql, { schema });

async function learner(id: string) {
  await db.insert(schema.user).values({ id, name: id, email: `${id}@test.local` });
  await repo.completeOnboarding(db, id, { nativeLanguage: "ar", targetLanguage: "en", goal: "work", dailyMinutes: 15, selfLevel: "A2" }, "ar");
  return id;
}

beforeEach(async () => {
  process.env.AI_PROVIDER = "fake";
  delete process.env.AI_DAILY_MESSAGES_PER_USER;
  delete process.env.AI_MONTHLY_BUDGET_USD;
  await sql`truncate "user", activity_events, learning_tracks, profiles, conversations, error_log, ai_usage, exercise_attempts, lesson_progress cascade`;
});
afterEach(() => {
  delete process.env.AI_PROVIDER;
});
afterAll(async () => {
  await sql.end();
});

describe("pricing", () => {
  it("prices Opus 5.5 at $4/$20 per MTok, cache reads at $0.20 and writes at 1.25×", () => {
    expect(costMicros("claude-opus-5-5", { input: 1_000_000, cacheWrite: 0, cacheRead: 0, output: 0 })).toBe(4_000_000);
    expect(costMicros("claude-opus-5-5", { input: 0, cacheWrite: 0, cacheRead: 0, output: 1_000_000 })).toBe(20_000_000);
    expect(costMicros("claude-opus-5-5", { input: 0, cacheWrite: 1_000_000, cacheRead: 1_000_000, output: 0 })).toBe(5_200_000);
  });
});

describe("tutor conversations", () => {
  it("is honestly unavailable when the AI isn't configured", async () => {
    delete process.env.AI_PROVIDER;
    delete process.env.ANTHROPIC_API_KEY;
    const a = await learner("alice");
    const c = await convo.startConversation(db, a, "ar", { kind: "tutor", persona: "friendly" });
    await expect(convo.sendMessage(db, a, c.id, "Hello", "ar")).rejects.toMatchObject({ code: "not_configured" });
    expect(await db.select().from(schema.conversationMessages)).toHaveLength(0);
  });

  it("stores the exchange, corrections (error memory), usage and activity", async () => {
    const a = await learner("alice");
    const c = await convo.startConversation(db, a, "ar", { kind: "tutor", persona: "friendly" });
    const r = await convo.sendMessage(db, a, c.id, "Yesterday I has a meeting", "ar");
    expect(r.assistantMessage.content).toMatch(/^\[test\]/);
    expect(r.corrections).toEqual([expect.objectContaining({ original: "I has", corrected: "I have", rule_tag: "have-has" })]);
    const errors = await db.select().from(schema.errorLog).where(eq(schema.errorLog.userId, a));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ source: "tutor", ruleTag: "have-has" });
    expect(await db.select().from(schema.aiUsage)).toHaveLength(1);
    const { messages } = await convo.getConversation(db, a, c.id);
    expect(messages.map((m) => m.role)).toEqual(["user", "assistant"]);
    expect((await convo.recurringErrors(db, a, c.trackId))[0]).toMatchObject({ tag: "have-has", count: 1 });
  });

  it("links repeated conversation corrections into review without an extra AI call", async () => {
    const a = await learner("alice");
    const c = await convo.startConversation(db, a, "ar", { kind: "tutor", persona: "friendly" });
    await convo.sendMessage(db, a, c.id, "I has a meeting", "ar");
    expect(await db.select().from(schema.savedWords)).toHaveLength(0);
    await convo.sendMessage(db, a, c.id, "I has another meeting", "ar");
    expect(await db.select().from(schema.savedWords)).toEqual([expect.objectContaining({ userId: a, language: "en", term: "i have", source: "mistake:have-has" })]);
    expect(await db.select().from(schema.aiUsage)).toHaveLength(2);
  });

  it("feeds past mistakes and weak lesson rules into the tutor's prompt (memory)", async () => {
    const a = await learner("alice");
    const c = await convo.startConversation(db, a, "en", { kind: "tutor", persona: "business" });
    await convo.sendMessage(db, a, c.id, "I has two meetings", "en");
    await study.checkExercise(db, a, "en-a1-u1-l1", "e1", 0); // wrong → tag "to-be"
    const memory = await buildMemory(db, a, c.trackId, "en");
    expect(memory.weakRules.map((w) => w.tag).sort()).toEqual(["have-has", "to-be"]);
    expect(memory.explainName).toBe("Arabic");
    const prompt = tutorSystem("business", memory);
    expect(prompt).toContain('"I has" → "I have"');
    expect(prompt).toContain("have-has ×1");
    expect(prompt).toContain("self-rated");
  });

  it("enforces the per-user daily limit and the monthly budget", async () => {
    const a = await learner("alice");
    const c = await convo.startConversation(db, a, "ar", { kind: "tutor", persona: "friendly" });
    process.env.AI_DAILY_MESSAGES_PER_USER = "1";
    await convo.sendMessage(db, a, c.id, "Hi", "ar");
    await expect(convo.sendMessage(db, a, c.id, "Hi again", "ar")).rejects.toMatchObject({ code: "daily_limit" });
    process.env.AI_DAILY_MESSAGES_PER_USER = "100";
    process.env.AI_MONTHLY_BUDGET_USD = "1";
    await db.insert(schema.aiUsage).values({ userId: null, feature: "tutor", model: "x", inputTokens: 0, outputTokens: 0, costMicros: 1_000_000 });
    expect(await checkLimits(db, a)).toBe("budget_exhausted");
  });

  it("other users cannot read or write someone else's conversation", async () => {
    const a = await learner("alice");
    const b = await learner("bob");
    const c = await convo.startConversation(db, a, "ar", { kind: "tutor", persona: "friendly" });
    await expect(convo.getConversation(db, b, c.id)).rejects.toThrow("not_found");
    await expect(convo.sendMessage(db, b, c.id, "hi", "ar")).rejects.toThrow("not_found");
    expect(await convo.listConversations(db, b)).toEqual([]);
  });
});

describe("role-play", () => {
  it("opens in character, collects corrections silently, and ends with a stored report", async () => {
    const a = await learner("alice");
    const c = await convo.startConversation(db, a, "ar", { kind: "roleplay", scenario: "hotel" });
    let { messages } = await convo.getConversation(db, a, c.id);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ role: "assistant" });
    await convo.sendMessage(db, a, c.id, "Yes, I has a reservation", "ar");
    const report = await convo.finishRoleplay(db, a, c.id, "ar");
    expect(report.estimated_level).toBe("A2");
    const done = await convo.getConversation(db, a, c.id);
    expect(done.conversation.status).toBe("completed");
    await expect(convo.sendMessage(db, a, c.id, "more", "ar")).rejects.toMatchObject({ code: "finished" });
    ({ messages } = done);
    expect(messages).toHaveLength(3);
    const errors = await db.select().from(schema.errorLog);
    expect(errors[0]).toMatchObject({ source: "roleplay" });
    // Finishing twice returns the stored report without another AI call.
    const usageBefore = (await db.select().from(schema.aiUsage)).length;
    await convo.finishRoleplay(db, a, c.id, "ar");
    expect((await db.select().from(schema.aiUsage)).length).toBe(usageBefore);
  });
});
