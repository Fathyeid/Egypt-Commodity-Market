import { afterAll, beforeEach, describe, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";
import * as repo from "@/lib/learner/repo";

const sql = postgres(process.env.DATABASE_URL!, { max: 2, onnotice: () => {} });
const db = drizzle(sql, { schema });

async function makeUser(id: string) {
  await db.insert(schema.user).values({ id, name: id, email: `${id}@test.local` });
  return id;
}
const base = { goal: "travel", dailyMinutes: 15, selfLevel: "A1" } as const;

beforeEach(async () => {
  await sql`truncate "user", activity_events, learning_tracks, profiles, placement_tests, lesson_progress, exercise_attempts, conversations, error_log, ai_usage, saved_words, writing_submissions, pron_attempts cascade`;
});
afterAll(async () => {
  await sql.end();
});

describe("onboarding", () => {
  it("creates profile and one active track", async () => {
    const a = await makeUser("alice");
    await repo.completeOnboarding(db, a, { nativeLanguage: "ar", targetLanguage: "de", ...base }, "ar");
    const p = await repo.getProfile(db, a);
    expect(p?.nativeLanguage).toBe("ar");
    expect(p?.onboardedAt).toBeInstanceOf(Date);
    const tracks = await repo.listTracks(db, a);
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toMatchObject({ targetLanguage: "de", isActive: true, placementLevel: null });
  });

  it("rejects unknown languages", async () => {
    const a = await makeUser("alice");
    await expect(repo.completeOnboarding(db, a, { nativeLanguage: "ar", targetLanguage: "xx", ...base }, "ar")).rejects.toThrow("language_unavailable");
  });
});

describe("tracks", () => {
  it("adds a track, makes it the only active one, and blocks duplicates and native language", async () => {
    const a = await makeUser("alice");
    await repo.completeOnboarding(db, a, { nativeLanguage: "ar", targetLanguage: "de", ...base }, "ar");
    await repo.addTrack(db, a, { targetLanguage: "fr", ...base });
    const tracks = await repo.listTracks(db, a);
    expect(tracks.filter((t) => t.isActive).map((t) => t.targetLanguage)).toEqual(["fr"]);
    await expect(repo.addTrack(db, a, { targetLanguage: "fr", ...base })).rejects.toThrow("duplicate_track");
    await expect(repo.addTrack(db, a, { targetLanguage: "ar", ...base })).rejects.toThrow("same_language");
  });

  it("deleting the active track activates another; the last track cannot be deleted", async () => {
    const a = await makeUser("alice");
    await repo.completeOnboarding(db, a, { nativeLanguage: "ar", targetLanguage: "de", ...base }, "ar");
    const fr = await repo.addTrack(db, a, { targetLanguage: "fr", ...base });
    await repo.deleteTrack(db, a, fr.id);
    const left = await repo.listTracks(db, a);
    expect(left).toHaveLength(1);
    expect(left[0].isActive).toBe(true);
    await expect(repo.deleteTrack(db, a, left[0].id)).rejects.toThrow("last_track");
  });
});

describe("isolation between users", () => {
  it("user B cannot read, activate, update or delete user A's tracks", async () => {
    const a = await makeUser("alice");
    const b = await makeUser("bob");
    await repo.completeOnboarding(db, a, { nativeLanguage: "ar", targetLanguage: "de", ...base }, "ar");
    await repo.addTrack(db, a, { targetLanguage: "fr", ...base });
    await repo.completeOnboarding(db, b, { nativeLanguage: "en", targetLanguage: "es", ...base }, "en");
    const aTracks = await repo.listTracks(db, a);
    const victim = aTracks[0];

    expect((await repo.listTracks(db, b)).map((t) => t.targetLanguage)).toEqual(["es"]);
    await expect(repo.setActiveTrack(db, b, victim.id)).rejects.toThrow("not_found");
    await expect(repo.updateTrack(db, b, victim.id, { goal: "work", dailyMinutes: 60, selfLevel: "C1" })).rejects.toThrow("not_found");
    await expect(repo.deleteTrack(db, b, victim.id)).rejects.toThrow("not_found");

    const after = await repo.listTracks(db, a);
    expect(after).toEqual(aTracks);
    expect((await repo.getActiveTrack(db, b))?.targetLanguage).toBe("es");
  });

  it("dashboard stats only count the user's own activity", async () => {
    const a = await makeUser("alice");
    const b = await makeUser("bob");
    await db.insert(schema.activityEvents).values([
      { userId: a, kind: "lesson", durationSeconds: 600, xp: 20 },
      { userId: b, kind: "lesson", durationSeconds: 3000, xp: 99 },
    ]);
    const s = await repo.getDashboardStats(db, a, null);
    expect(s).toMatchObject({ minutesThisWeek: 10, totalXp: 20, streak: 1 });
  });

  it("a new user's dashboard is all zeros (no fake data)", async () => {
    const a = await makeUser("alice");
    expect(await repo.getDashboardStats(db, a, null)).toMatchObject({ minutesThisWeek: 0, xpThisWeek: 0, totalXp: 0, streak: 0 });
  });
});

describe("computeStreak", () => {
  const now = new Date("2026-11-19T12:00:00Z");
  it("counts consecutive days ending today", () => {
    expect(repo.computeStreak(["2026-11-19", "2026-11-18", "2026-11-17", "2026-11-15"], now)).toBe(3);
  });
  it("allows the streak to end yesterday", () => {
    expect(repo.computeStreak(["2026-11-18", "2026-11-17"], now)).toBe(2);
  });
  it("is zero when the last activity is older", () => {
    expect(repo.computeStreak(["2026-11-16"], now)).toBe(0);
  });
});


describe("daily activity summary", () => {
  it("isolates tracks and users, aggregates repeat activity, and ignores future rows", async () => {
    const a = await makeUser("alice");
    const b = await makeUser("bob");
    await repo.completeOnboarding(db, a, { nativeLanguage: "ar", targetLanguage: "de", ...base }, "ar");
    const de = (await repo.getActiveTrack(db, a))!;
    const fr = await repo.addTrack(db, a, { targetLanguage: "fr", ...base });
    const now = new Date("2026-11-21T12:00:00Z");
    await db.insert(schema.activityEvents).values([
      { userId: a, trackId: de.id, kind: "lesson", xp: 18, durationSeconds: 120, createdAt: new Date("2026-11-21T00:00:00Z") },
      { userId: a, trackId: de.id, kind: "review", xp: 2, durationSeconds: 8, createdAt: new Date("2026-11-21T11:00:00Z") },
      { userId: a, trackId: de.id, kind: "lesson", xp: 10, createdAt: new Date("2026-11-20T10:00:00Z") },
      { userId: a, trackId: de.id, kind: "lesson", xp: 99, createdAt: new Date("2026-11-22T00:00:00Z") },
      { userId: a, trackId: fr.id, kind: "lesson", xp: 50, createdAt: now },
      { userId: b, kind: "lesson", xp: 100, createdAt: now },
    ]);
    const stats = await repo.getDashboardStats(db, a, de.id, now);
    expect(stats).toMatchObject({ streak: 2, activeToday: true, xpToday: 20, minutesToday: 2, totalXp: 30, xpThisWeek: 30 });
    expect(stats.recentDays).toHaveLength(7);
    expect(stats.recentDays[6]).toEqual({ day: "2026-11-21", xp: 20, seconds: 128, activities: 2 });
    expect((await repo.getDashboardStats(db, a, fr.id, now)).totalXp).toBe(50);
  });

  it("preserves yesterday's streak but leaves today empty until practice", async () => {
    const a = await makeUser("alice");
    await db.insert(schema.activityEvents).values({ userId: a, kind: "review", xp: 2, createdAt: new Date("2026-11-20T23:59:59Z") });
    const stats = await repo.getDashboardStats(db, a, null, new Date("2026-11-21T00:00:00Z"));
    expect(stats).toMatchObject({ streak: 1, activeToday: false, xpToday: 0, minutesToday: 0 });
    expect(stats.recentDays[5].activities).toBe(1);
  });
});
