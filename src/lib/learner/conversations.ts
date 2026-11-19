/**
 * AI tutor and role-play conversations. Every function is scoped by userId.
 * Each AI call: check limits → build learner memory → call the model →
 * store messages, corrections (error_log), usage/cost (ai_usage) and activity.
 */
import { and, asc, desc, eq } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { activityEvents, aiUsage, conversationMessages, conversations, errorLog } from "@/lib/db/schema";
import { generate, type ChatMessage } from "@/lib/ai/provider";
import { checkLimits } from "@/lib/ai/limits";
import { roleplayReportSystem, roleplaySystem, tutorSystem } from "@/lib/ai/prompts";
import { RoleplayReport, RoleplayTurn, TutorReply, type Correction } from "@/lib/ai/schemas";
import { PERSONAS, SCENARIOS, type PersonaId, type ScenarioId } from "@/lib/ai/catalog";
import { buildMemory } from "./memory";
import { DomainError, getActiveTrack } from "./repo";
import { fakeReport, fakeRoleplay, fakeTutor } from "@/lib/ai/fake";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export type ConversationError = "not_configured" | "refused" | "busy" | "failed" | "daily_limit" | "budget_exhausted" | "not_found" | "finished";
export class ConversationFailure extends Error {
  constructor(public code: ConversationError) {
    super(code);
  }
}

const HISTORY_LIMIT = 30;
const MAX_MESSAGE_CHARS = 1000;

async function ownConversation(db: Db, userId: string, id: string) {
  const [c] = await db.select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
  if (!c) throw new DomainError("not_found");
  return c;
}

export async function listConversations(db: Db, userId: string, limit = 10) {
  return db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt)).limit(limit);
}

export async function getConversation(db: Db, userId: string, id: string) {
  const c = await ownConversation(db, userId, id);
  const messages = await db.select().from(conversationMessages).where(eq(conversationMessages.conversationId, id)).orderBy(asc(conversationMessages.createdAt));
  return { conversation: c, messages };
}

async function recordUsage(db: Db, userId: string, feature: string, r: { model: string; inputTokens: number; outputTokens: number; costMicros: number }) {
  await db.insert(aiUsage).values({ userId, feature, model: r.model, inputTokens: r.inputTokens, outputTokens: r.outputTokens, costMicros: r.costMicros });
}

async function guard(db: Db, userId: string) {
  const l = await checkLimits(db, userId);
  if (l !== "ok") throw new ConversationFailure(l);
}

function failFrom(error: "not_configured" | "refused" | "busy" | "failed"): never {
  throw new ConversationFailure(error);
}

/** Start a conversation. Role-plays get the AI's opening line immediately. */
export async function startConversation(db: Db, userId: string, uiLocale: "ar" | "en", input: { kind: "tutor"; persona: PersonaId } | { kind: "roleplay"; scenario: ScenarioId }) {
  const track = await getActiveTrack(db, userId);
  if (!track) throw new DomainError("not_found");
  if (input.kind === "tutor" && !(input.persona in PERSONAS)) throw new DomainError("not_found");
  if (input.kind === "roleplay" && !(input.scenario in SCENARIOS)) throw new DomainError("not_found");

  let opening: string | null = null;
  if (input.kind === "roleplay") {
    await guard(db, userId);
    const memory = await buildMemory(db, userId, track.id, uiLocale);
    const r = await generate({
      system: roleplaySystem(input.scenario, memory),
      messages: [{ role: "user", content: "(The learner has entered the scene. Start now.)" }],
      schema: RoleplayTurn,
      fake: () => fakeRoleplay(null),
    });
    if (!r.ok) failFrom(r.error);
    await recordUsage(db, userId, "roleplay", r);
    opening = r.data.reply;
  }

  const [c] = await db
    .insert(conversations)
    .values({
      userId,
      trackId: track.id,
      kind: input.kind,
      persona: input.kind === "tutor" ? input.persona : null,
      scenario: input.kind === "roleplay" ? input.scenario : null,
    })
    .returning();
  if (opening) await db.insert(conversationMessages).values({ conversationId: c.id, role: "assistant", content: opening });
  return c;
}

/** Send a learner message and get the AI reply (with corrections). */
export async function sendMessage(db: Db, userId: string, conversationId: string, text: string, uiLocale: "ar" | "en") {
  const content = text.trim().slice(0, MAX_MESSAGE_CHARS);
  if (!content) throw new DomainError("not_found");
  const c = await ownConversation(db, userId, conversationId);
  if (c.status !== "active") throw new ConversationFailure("finished");
  await guard(db, userId);

  const memory = await buildMemory(db, userId, c.trackId, uiLocale);
  const prior = await db
    .select({ role: conversationMessages.role, content: conversationMessages.content })
    .from(conversationMessages)
    .where(eq(conversationMessages.conversationId, c.id))
    .orderBy(desc(conversationMessages.createdAt))
    .limit(HISTORY_LIMIT);
  const history: ChatMessage[] = prior.reverse().map((m) => ({ role: m.role as ChatMessage["role"], content: m.content }));
  // Role-plays start with an assistant line; the API needs a user turn first.
  if (history[0]?.role === "assistant") history.unshift({ role: "user", content: "(The learner has entered the scene.)" });
  history.push({ role: "user", content });

  let reply: string;
  let corrections: Correction[];
  let newWords: { term: string; meaning: string }[] = [];
  if (c.kind === "tutor") {
    const r = await generate({ system: tutorSystem(c.persona as PersonaId, memory), messages: history, schema: TutorReply, fake: () => fakeTutor(content) });
    if (!r.ok) failFrom(r.error);
    await recordUsage(db, userId, "tutor", r);
    ({ reply, corrections } = r.data);
    newWords = r.data.new_words.slice(0, 3);
  } else {
    const r = await generate({ system: roleplaySystem(c.scenario as ScenarioId, memory), messages: history, schema: RoleplayTurn, fake: () => fakeRoleplay(content) });
    if (!r.ok) failFrom(r.error);
    await recordUsage(db, userId, "roleplay", r);
    ({ reply, corrections } = r.data);
  }
  corrections = corrections.filter((x) => x.original.trim() && x.original.trim() !== x.corrected.trim()).slice(0, 5);

  const [userMsg, aiMsg] = await db.transaction(async (tx) => {
    const [u] = await tx.insert(conversationMessages).values({ conversationId: c.id, role: "user", content, corrections: corrections.length ? corrections : null }).returning();
    const [a] = await tx.insert(conversationMessages).values({ conversationId: c.id, role: "assistant", content: reply, corrections: newWords.length ? { newWords } : null }).returning();
    if (corrections.length) {
      await tx.insert(errorLog).values(
        corrections.map((x) => ({
          userId,
          trackId: c.trackId,
          source: c.kind,
          category: x.category,
          ruleTag: x.rule_tag.toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 40) || "other",
          original: x.original.slice(0, 300),
          corrected: x.corrected.slice(0, 300),
          explanation: x.explanation.slice(0, 600),
        })),
      );
    }
    await tx.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, c.id));
    await tx.insert(activityEvents).values({ userId, trackId: c.trackId, kind: c.kind, durationSeconds: 60, xp: 2 });
    return [u, a];
  });
  return { userMessage: userMsg, assistantMessage: aiMsg, corrections, newWords };
}

/** End a role-play and produce the report (grammar, vocabulary, fluency, errors, better phrases). */
export async function finishRoleplay(db: Db, userId: string, conversationId: string, uiLocale: "ar" | "en") {
  const c = await ownConversation(db, userId, conversationId);
  if (c.kind !== "roleplay") throw new DomainError("not_found");
  if (c.status === "completed") return c.report as RoleplayReport;
  const msgs = await db.select().from(conversationMessages).where(eq(conversationMessages.conversationId, c.id)).orderBy(asc(conversationMessages.createdAt));
  if (!msgs.some((m) => m.role === "user")) throw new ConversationFailure("not_found");
  await guard(db, userId);
  const memory = await buildMemory(db, userId, c.trackId, uiLocale);
  const transcript = msgs.map((m) => `${m.role === "user" ? "LEARNER" : "PARTNER"}: ${m.content}`).join("\n");
  const r = await generate({
    system: roleplayReportSystem(c.scenario as ScenarioId, memory),
    messages: [{ role: "user", content: `Transcript:\n${transcript}` }],
    schema: RoleplayReport,
    maxTokens: 6000,
    fake: () => fakeReport(msgs.filter((m) => m.role === "user").length),
  });
  if (!r.ok) failFrom(r.error);
  await recordUsage(db, userId, "roleplay_report", r);
  await db.update(conversations).set({ status: "completed", report: r.data, updatedAt: new Date() }).where(eq(conversations.id, c.id));
  await db.insert(activityEvents).values({ userId, trackId: c.trackId, kind: "roleplay_report", durationSeconds: 0, xp: 15 });
  return r.data;
}

/** Most frequent recent mistakes for the dashboard. */
export async function recurringErrors(db: Db, userId: string, trackId: string, limit = 5) {
  const rows = await db
    .select({ tag: errorLog.ruleTag, original: errorLog.original, corrected: errorLog.corrected, createdAt: errorLog.createdAt })
    .from(errorLog)
    .where(and(eq(errorLog.userId, userId), eq(errorLog.trackId, trackId)))
    .orderBy(desc(errorLog.createdAt))
    .limit(200);
  const byTag = new Map<string, { tag: string; count: number; example: { original: string; corrected: string } }>();
  for (const r of rows) {
    const e = byTag.get(r.tag);
    if (e) e.count++;
    else byTag.set(r.tag, { tag: r.tag, count: 1, example: { original: r.original, corrected: r.corrected } });
  }
  return [...byTag.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}
