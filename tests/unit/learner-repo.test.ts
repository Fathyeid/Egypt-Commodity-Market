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
    expect(await repo.getDashboardStats(db, a, null)).toEqual({ minutesThisWeek: 0, xpThisWeek: 0, totalXp: 0, streak: 0 });
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
