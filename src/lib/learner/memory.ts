/**
 * The learner model the AI reads before every reply: levels, recurring weak
 * points (from lesson answers and past AI corrections), recent mistakes and
 * words from completed lessons. Built fresh from the database each time.
 */
import { and, desc, eq, gte, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { errorLog, exerciseAttempts, languages, learningTracks, lessonProgress, profiles, skillLevels } from "@/lib/db/schema";
import { lessonVocabulary } from "@/lib/curriculum";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export type LearnerMemory = {
  target: string;
  targetName: string;
  nativeName: string;
  explainName: string;
  level: string;
  levelSource: "placement" | "self";
  goal: string | null;
  skills: { skill: string; level: string }[];
  weakRules: { tag: string; count: number }[];
  recentErrors: { original: string; corrected: string; tag: string }[];
  knownWords: string[];
};

const WINDOW_DAYS = 30;

export async function buildMemory(db: Db, userId: string, trackId: string, uiLocale: "ar" | "en"): Promise<LearnerMemory> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 3600 * 1000);
  const [track] = await db.select().from(learningTracks).where(and(eq(learningTracks.id, trackId), eq(learningTracks.userId, userId)));
  if (!track) throw new Error("track not found");
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
  const langRows = await db.select({ code: languages.code, nameEn: languages.nameEn }).from(languages);
  const nameOf = (c: string | null | undefined) => langRows.find((l) => l.code === c)?.nameEn ?? c ?? "unknown";

  const [skills, lessonWeak, aiWeak, recent, done] = await Promise.all([
    db.select({ skill: skillLevels.skill, level: skillLevels.level }).from(skillLevels).where(eq(skillLevels.trackId, trackId)),
    db
      .select({ tag: exerciseAttempts.tag, count: sql<number>`count(*)::int` })
      .from(exerciseAttempts)
      .where(and(eq(exerciseAttempts.userId, userId), eq(exerciseAttempts.correct, false), gte(exerciseAttempts.createdAt, since), sql`${exerciseAttempts.tag} is not null`, sql`${exerciseAttempts.lessonId} like ${track.targetLanguage + "-%"}`))
      .groupBy(exerciseAttempts.tag),
    db
      .select({ tag: errorLog.ruleTag, count: sql<number>`count(*)::int` })
      .from(errorLog)
      .where(and(eq(errorLog.userId, userId), eq(errorLog.trackId, trackId), gte(errorLog.createdAt, since)))
      .groupBy(errorLog.ruleTag),
    db
      .select({ original: errorLog.original, corrected: errorLog.corrected, tag: errorLog.ruleTag })
      .from(errorLog)
      .where(and(eq(errorLog.userId, userId), eq(errorLog.trackId, trackId)))
      .orderBy(desc(errorLog.createdAt))
      .limit(8),
    db.select({ lessonId: lessonProgress.lessonId }).from(lessonProgress).where(eq(lessonProgress.userId, userId)).orderBy(desc(lessonProgress.updatedAt)).limit(10),
  ]);

  // Merge weak points from this language's lessons and from AI corrections.
  const counts = new Map<string, number>();
  for (const r of [...lessonWeak, ...aiWeak]) if (r.tag) counts.set(r.tag, (counts.get(r.tag) ?? 0) + r.count);
  const weakRules = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const vocab = await lessonVocabulary(db, done.map((d) => d.lessonId));
  const knownWords = [...vocab.values()]
    .filter((v) => v.language === track.targetLanguage)
    .flatMap((v) => v.terms)
    .slice(0, 30);

  const native = profile?.nativeLanguage ?? null;
  return {
    target: track.targetLanguage,
    targetName: nameOf(track.targetLanguage),
    nativeName: nameOf(native),
    // Explain in the native language when it differs from the target; otherwise the interface language.
    explainName: native && native !== track.targetLanguage ? nameOf(native) : uiLocale === "ar" ? "Arabic" : "English",
    level: track.placementLevel ?? track.selfLevel,
    levelSource: track.placementLevel ? "placement" : "self",
    goal: track.goal,
    skills,
    weakRules,
    recentErrors: recent,
    knownWords,
  };
}
