/**
 * Listening/reading answers, saved words, writing feedback and pronunciation
 * attempts. Every function is scoped by the authenticated userId.
 */
import { and, desc, eq, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { activityEvents, aiUsage, errorLog, exerciseAttempts, lessonProgress, pronAttempts, savedWords, writingSubmissions } from "@/lib/db/schema";
import { findText } from "@/content";
import { findWritingTask } from "@/content/writing";
import { generate } from "@/lib/ai/provider";
import { checkLimits } from "@/lib/ai/limits";
import { writingSystem } from "@/lib/ai/prompts";
import { WritingFeedback } from "@/lib/ai/schemas";
import { fakeWriting } from "@/lib/ai/fake";
import type { PronResult } from "@/lib/speech/azure";
import { buildMemory } from "./memory";
import { ConversationFailure } from "./conversations";
import { DomainError, getActiveTrack } from "./repo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

/* ----------------------------- Texts ----------------------------- */

export async function resolveText(db: Db, userId: string, id: string) {
  const item = findText(id);
  const track = await getActiveTrack(db, userId);
  if (!item || !track || item.language !== track.targetLanguage) throw new DomainError("not_found");
  return { item, track };
}

export async function submitTextAnswers(db: Db, userId: string, id: string, answers: Record<string, number>) {
  const { item, track } = await resolveText(db, userId, id);
  const results = item.questions.map((q) => ({ id: q.id, correct: answers[q.id] === q.answer, expected: q.options[q.answer] }));
  const correct = results.filter((r) => r.correct).length;
  const score = Math.round((correct / item.questions.length) * 100);
  const key = `text:${item.id}`;
  await db.transaction(async (tx) => {
    await tx.insert(exerciseAttempts).values(
      results.map((r) => ({ userId, lessonId: key, exerciseId: r.id, tag: item.kind, correct: r.correct, answer: String(answers[r.id] ?? "") })),
    );
    await tx
      .insert(lessonProgress)
      .values({ userId, lessonId: key, bestScore: score })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: { bestScore: sql`greatest(${lessonProgress.bestScore}, ${score})`, attempts: sql`${lessonProgress.attempts} + 1`, updatedAt: new Date() },
      });
    await tx.insert(activityEvents).values({ userId, trackId: track.id, kind: item.kind, durationSeconds: 120, xp: 5 + correct * 2 });
  });
  return { score, correct, total: item.questions.length, results };
}

/* --------------------------- Saved words --------------------------- */

export async function saveWord(db: Db, userId: string, input: { language: string; term: string; meaning: string | null; source: string }) {
  const term = input.term.trim().toLowerCase().slice(0, 80);
  if (!term) throw new DomainError("not_found");
  const track = await getActiveTrack(db, userId);
  if (!track || track.targetLanguage !== input.language) throw new DomainError("not_found");
  await db
    .insert(savedWords)
    .values({ userId, language: input.language, term, meaning: input.meaning?.slice(0, 200) ?? null, source: input.source.slice(0, 60) })
    .onConflictDoNothing();
}

export async function listSavedWords(db: Db, userId: string, language: string) {
  return db.select().from(savedWords).where(and(eq(savedWords.userId, userId), eq(savedWords.language, language))).orderBy(desc(savedWords.createdAt));
}

export async function deleteSavedWord(db: Db, userId: string, id: string) {
  await db.delete(savedWords).where(and(eq(savedWords.id, id), eq(savedWords.userId, userId)));
}

/* ----------------------------- Writing ----------------------------- */

export async function submitWriting(db: Db, userId: string, taskId: string, text: string, uiLocale: "ar" | "en") {
  const task = findWritingTask(taskId);
  const track = await getActiveTrack(db, userId);
  if (!task || !track) throw new DomainError("not_found");
  const body = text.trim().slice(0, 4000);
  if (body.split(/\s+/).filter(Boolean).length < 5) throw new ConversationFailure("not_found");
  const l = await checkLimits(db, userId);
  if (l !== "ok") throw new ConversationFailure(l);
  const memory = await buildMemory(db, userId, track.id, uiLocale);
  const r = await generate({
    system: writingSystem({ type: task.type, level: task.level, promptEn: task.prompt.en, minWords: task.minWords }, memory),
    messages: [{ role: "user", content: body }],
    schema: WritingFeedback,
    maxTokens: 8000,
    fake: () => fakeWriting(body),
  });
  if (!r.ok) throw new ConversationFailure(r.error);
  const fb = r.data;
  const [row] = await db.transaction(async (tx) => {
    await tx.insert(aiUsage).values({ userId, feature: "writing", model: r.model, inputTokens: r.inputTokens, outputTokens: r.outputTokens, costMicros: r.costMicros });
    const errors = fb.errors.filter((x) => x.original.trim() && x.original.trim() !== x.corrected.trim()).slice(0, 12);
    if (errors.length) {
      await tx.insert(errorLog).values(
        errors.map((x) => ({
          userId,
          trackId: track.id,
          source: "writing",
          category: x.category,
          ruleTag: x.rule_tag.toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 40) || "other",
          original: x.original.slice(0, 300),
          corrected: x.corrected.slice(0, 300),
          explanation: x.explanation.slice(0, 600),
        })),
      );
    }
    await tx.insert(activityEvents).values({ userId, trackId: track.id, kind: "writing", durationSeconds: 300, xp: 15 });
    return tx.insert(writingSubmissions).values({ userId, trackId: track.id, taskId, text: body, feedback: { ...fb, errors } }).returning();
  });
  return row;
}

export async function listWriting(db: Db, userId: string, limit = 10) {
  return db.select().from(writingSubmissions).where(eq(writingSubmissions.userId, userId)).orderBy(desc(writingSubmissions.createdAt)).limit(limit);
}

export async function getWriting(db: Db, userId: string, id: string) {
  const [row] = await db.select().from(writingSubmissions).where(and(eq(writingSubmissions.id, id), eq(writingSubmissions.userId, userId)));
  if (!row) throw new DomainError("not_found");
  return { ...row, feedback: row.feedback as WritingFeedback };
}

/* -------------------------- Pronunciation -------------------------- */

/** Rough Azure speech-to-text list price: ~$1 per audio hour → micro-dollars per second. */
const SPEECH_MICROS_PER_SECOND = 278;

export async function recordPronAttempt(db: Db, userId: string, input: { trackId: string; referenceText: string; locale: string; provider: string; result: PronResult; seconds: number }) {
  const [row] = await db.transaction(async (tx) => {
    await tx.insert(aiUsage).values({
      userId,
      feature: "pronunciation",
      model: input.provider === "azure" ? `azure-speech:${input.locale}` : "test",
      inputTokens: 0,
      outputTokens: 0,
      costMicros: input.provider === "azure" ? Math.ceil(input.seconds * SPEECH_MICROS_PER_SECOND) : 0,
    });
    await tx.insert(activityEvents).values({ userId, trackId: input.trackId, kind: "pronunciation", durationSeconds: Math.round(input.seconds), xp: 3 });
    return tx
      .insert(pronAttempts)
      .values({ userId, trackId: input.trackId, referenceText: input.referenceText, locale: input.locale, provider: input.provider, scores: input.result.scores, words: input.result.words })
      .returning();
  });
  return row;
}

export async function pronHistory(db: Db, userId: string, trackId: string, limit = 20) {
  return db
    .select({ id: pronAttempts.id, referenceText: pronAttempts.referenceText, scores: pronAttempts.scores, createdAt: pronAttempts.createdAt })
    .from(pronAttempts)
    .where(and(eq(pronAttempts.userId, userId), eq(pronAttempts.trackId, trackId)))
    .orderBy(desc(pronAttempts.createdAt))
    .limit(limit);
}
