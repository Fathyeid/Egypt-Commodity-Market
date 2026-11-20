import { describe, expect, it } from "vitest";
import { earnedBadges, levelFromXp, schedule } from "@/lib/learner/srs";

const fresh = { intervalDays: 0, ease: 2.5, reps: 0, lapses: 0 };
const now = new Date("2026-01-01T00:00:00Z");

describe("spaced repetition", () => {
  it("grows intervals with successful recalls and resets on a lapse", () => {
    const a = schedule(fresh, "good", now);
    expect(a.intervalDays).toBe(1);
    expect(a.dueAt.toISOString()).toBe("2026-01-02T00:00:00.000Z");
    const b = schedule(a, "good", now);
    expect(b.intervalDays).toBe(3);
    const c = schedule(b, "good", now);
    expect(c.intervalDays).toBeGreaterThan(6);
    const lapse = schedule(c, "again", now);
    expect(lapse).toMatchObject({ intervalDays: 0, reps: 0, lapses: 1 });
    expect(lapse.dueAt.getTime() - now.getTime()).toBe(10 * 60 * 1000);
    expect(lapse.ease).toBeLessThan(c.ease);
  });
  it("orders hard < good < easy and never drops ease below 1.3", () => {
    const h = schedule(fresh, "hard", now), g = schedule(fresh, "good", now), e = schedule(fresh, "easy", now);
    expect(h.intervalDays).toBeLessThan(g.intervalDays);
    expect(g.intervalDays).toBeLessThan(e.intervalDays);
    let card = { ...fresh, reps: 2, intervalDays: 10 };
    for (let i = 0; i < 20; i++) card = schedule(card, i % 2 ? "again" : "hard", now);
    expect(card.ease).toBeGreaterThanOrEqual(1.3);
  });
});

describe("levels and badges", () => {
  it("levels need 0, 100, 300, 600 XP", () => {
    expect(levelFromXp(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNext: 100 });
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(300)).toEqual({ level: 3, xpIntoLevel: 0, xpForNext: 300 });
  });
  it("badges are earned only from real counts", () => {
    const none = earnedBadges({ lessons: 0, streak: 0, words: 0, xp: 0 });
    expect(none.every((b) => !b.earned)).toBe(true);
    const some = earnedBadges({ lessons: 12, streak: 3, words: 30, xp: 50 });
    expect(some.filter((b) => b.earned).map((b) => b.id)).toEqual(["first_lesson", "lessons_10", "streak_3", "words_25"]);
  });
});
