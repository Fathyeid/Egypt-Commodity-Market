import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { errorLog, learningTracks, savedWords } from "@/lib/db/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

/** Repeated tutor/roleplay corrections join the existing deck, without resetting
 * a saved word's schedule or replacing the learner's own meaning. No AI call.
 * Only the same original/corrected pair seen at least twice in 60 days qualifies.
 */
export async function addRecurringMistakeWords(db: Db, userId: string, trackId: string, now = new Date()) {
  const [track] = await db.select().from(learningTracks)
    .where(and(eq(learningTracks.userId, userId), eq(learningTracks.id, trackId)));
  if (!track) return;
  const since = new Date(now.getTime() - 60 * 86400000);
  const rows = await db.select({
    original: errorLog.original, corrected: errorLog.corrected, tag: errorLog.ruleTag,
    explanation: sql<string>`max(${errorLog.explanation})`,
  }).from(errorLog).where(and(
    eq(errorLog.userId, userId), eq(errorLog.trackId, trackId),
    inArray(errorLog.source, ["tutor", "roleplay"]), gte(errorLog.createdAt, since), lte(errorLog.createdAt, now),
  )).groupBy(errorLog.original, errorLog.corrected, errorLog.ruleTag)
    .having(sql`count(*) >= 2`).orderBy(desc(sql`max(${errorLog.createdAt})`)).limit(20);
  const cards = rows.filter((r) => r.corrected.trim().length > 0 && r.corrected.trim().length <= 80 && r.original.trim() !== r.corrected.trim())
    .map((r) => ({ userId, language: track.targetLanguage, term: r.corrected.trim().toLowerCase(),
      meaning: `${r.original} → ${r.corrected}\n${r.explanation}`.slice(0, 200),
      source: `mistake:${r.tag}`.slice(0, 60), dueAt: now }));
  if (cards.length) await db.insert(savedWords).values(cards).onConflictDoNothing();
}
