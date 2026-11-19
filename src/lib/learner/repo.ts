/**
 * Learner data access. Every function takes the authenticated userId from the
 * caller and scopes every query by it — a user can never read or change
 * another user's rows (covered by tests/learner-repo.test.ts).
 */
import { and, asc, eq, gte, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { activityEvents, languages, learningTracks, profiles, user } from "@/lib/db/schema";
import type { OnboardingInput, ProfileInput, TrackInput } from "@/lib/validation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export class DomainError extends Error {
  constructor(public code: "not_found" | "language_unavailable" | "duplicate_track" | "same_language" | "last_track") {
    super(code);
  }
}

export async function listLanguages(db: Db) {
  return db.select().from(languages).where(eq(languages.enabled, true)).orderBy(asc(languages.sortOrder));
}

async function assertLanguage(db: Db, code: string) {
  const [row] = await db.select({ code: languages.code }).from(languages).where(and(eq(languages.code, code), eq(languages.enabled, true)));
  if (!row) throw new DomainError("language_unavailable");
}

export async function getProfile(db: Db, userId: string) {
  const [row] = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      nativeLanguage: profiles.nativeLanguage,
      uiLocale: profiles.uiLocale,
      onboardedAt: profiles.onboardedAt,
    })
    .from(user)
    .leftJoin(profiles, eq(profiles.userId, user.id))
    .where(eq(user.id, userId));
  return row ?? null;
}

export async function listTracks(db: Db, userId: string) {
  return db.select().from(learningTracks).where(eq(learningTracks.userId, userId)).orderBy(asc(learningTracks.createdAt));
}

export async function getActiveTrack(db: Db, userId: string) {
  const [row] = await db
    .select()
    .from(learningTracks)
    .where(and(eq(learningTracks.userId, userId), eq(learningTracks.isActive, true)));
  return row ?? null;
}

export async function completeOnboarding(db: Db, userId: string, input: OnboardingInput, uiLocale: "ar" | "en") {
  await assertLanguage(db, input.nativeLanguage);
  await assertLanguage(db, input.targetLanguage);
  await db.transaction(async (tx) => {
    await tx
      .insert(profiles)
      .values({ userId, nativeLanguage: input.nativeLanguage, uiLocale, onboardedAt: new Date() })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { nativeLanguage: input.nativeLanguage, onboardedAt: sql`coalesce(${profiles.onboardedAt}, now())` },
      });
    await tx.update(learningTracks).set({ isActive: false }).where(eq(learningTracks.userId, userId));
    await tx
      .insert(learningTracks)
      .values({ userId, targetLanguage: input.targetLanguage, goal: input.goal, dailyMinutes: input.dailyMinutes, selfLevel: input.selfLevel, isActive: true })
      .onConflictDoUpdate({
        target: [learningTracks.userId, learningTracks.targetLanguage],
        set: { goal: input.goal, dailyMinutes: input.dailyMinutes, selfLevel: input.selfLevel, isActive: true },
      });
  });
}

export async function updateProfile(db: Db, userId: string, input: ProfileInput) {
  await assertLanguage(db, input.nativeLanguage);
  await db.transaction(async (tx) => {
    await tx.update(user).set({ name: input.name }).where(eq(user.id, userId));
    await tx
      .insert(profiles)
      .values({ userId, nativeLanguage: input.nativeLanguage, uiLocale: input.uiLocale })
      .onConflictDoUpdate({ target: profiles.userId, set: { nativeLanguage: input.nativeLanguage, uiLocale: input.uiLocale } });
  });
}

export async function addTrack(db: Db, userId: string, input: TrackInput) {
  await assertLanguage(db, input.targetLanguage);
  const profile = await getProfile(db, userId);
  if (profile?.nativeLanguage === input.targetLanguage) throw new DomainError("same_language");
  const existing = await db
    .select({ id: learningTracks.id })
    .from(learningTracks)
    .where(and(eq(learningTracks.userId, userId), eq(learningTracks.targetLanguage, input.targetLanguage)));
  if (existing.length) throw new DomainError("duplicate_track");
  return db.transaction(async (tx) => {
    await tx.update(learningTracks).set({ isActive: false }).where(eq(learningTracks.userId, userId));
    const [row] = await tx
      .insert(learningTracks)
      .values({ userId, ...input, isActive: true })
      .returning();
    return row;
  });
}

export async function updateTrack(db: Db, userId: string, trackId: string, input: Omit<TrackInput, "targetLanguage">) {
  const rows = await db
    .update(learningTracks)
    .set({ goal: input.goal, dailyMinutes: input.dailyMinutes, selfLevel: input.selfLevel })
    .where(and(eq(learningTracks.id, trackId), eq(learningTracks.userId, userId)))
    .returning({ id: learningTracks.id });
  if (!rows.length) throw new DomainError("not_found");
}

export async function setActiveTrack(db: Db, userId: string, trackId: string) {
  await db.transaction(async (tx) => {
    const [own] = await tx
      .select({ id: learningTracks.id })
      .from(learningTracks)
      .where(and(eq(learningTracks.id, trackId), eq(learningTracks.userId, userId)));
    if (!own) throw new DomainError("not_found");
    await tx.update(learningTracks).set({ isActive: false }).where(eq(learningTracks.userId, userId));
    await tx.update(learningTracks).set({ isActive: true }).where(eq(learningTracks.id, trackId));
  });
}

export async function deleteTrack(db: Db, userId: string, trackId: string) {
  await db.transaction(async (tx) => {
    const mine = await tx.select().from(learningTracks).where(eq(learningTracks.userId, userId));
    const target = mine.find((t) => t.id === trackId);
    if (!target) throw new DomainError("not_found");
    if (mine.length === 1) throw new DomainError("last_track");
    await tx.delete(learningTracks).where(and(eq(learningTracks.id, trackId), eq(learningTracks.userId, userId)));
    if (target.isActive) {
      const next = mine.find((t) => t.id !== trackId)!;
      await tx.update(learningTracks).set({ isActive: true }).where(eq(learningTracks.id, next.id));
    }
  });
}

/** Real dashboard numbers, computed from activity_events. */
export async function getDashboardStats(db: Db, userId: string, trackId: string | null, now = new Date()) {
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const scope = trackId
    ? and(eq(activityEvents.userId, userId), eq(activityEvents.trackId, trackId))
    : eq(activityEvents.userId, userId);

  const [week] = await db
    .select({
      seconds: sql<number>`coalesce(sum(${activityEvents.durationSeconds}), 0)::int`,
      xp: sql<number>`coalesce(sum(${activityEvents.xp}), 0)::int`,
    })
    .from(activityEvents)
    .where(and(scope, gte(activityEvents.createdAt, weekAgo)));

  const [total] = await db
    .select({ xp: sql<number>`coalesce(sum(${activityEvents.xp}), 0)::int` })
    .from(activityEvents)
    .where(scope);

  const days = await db
    .select({ day: sql<string>`to_char(date_trunc('day', ${activityEvents.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')` })
    .from(activityEvents)
    .where(scope)
    .groupBy(sql`1`)
    .orderBy(sql`1 desc`)
    .limit(400);

  return {
    minutesThisWeek: Math.round(week.seconds / 60),
    xpThisWeek: week.xp,
    totalXp: total.xp,
    streak: computeStreak(days.map((d) => d.day), now),
    wordsLearned: 0, // vocabulary system arrives in Phase 5 — no table yet, so truly 0
  };
}

/** Consecutive UTC days with activity, ending today or yesterday. */
export function computeStreak(daysDesc: string[], now = new Date()): number {
  const set = new Set(daysDesc);
  const key = (d: Date) => d.toISOString().slice(0, 10);
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (!set.has(key(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (set.has(key(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
