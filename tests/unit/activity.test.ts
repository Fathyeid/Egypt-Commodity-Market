import { describe, expect, it } from "vitest";
import { activityWeek, computeStreak, utcDayKey, utcDayStart } from "@/lib/learner/activity";

describe("daily activity calendar", () => {
  it("keeps the existing UTC day policy explicit across Cairo midnight", () => {
    const now = new Date("2026-11-22T00:30:00+02:00");
    expect(utcDayKey(now)).toBe("2026-11-21");
    expect(utcDayStart(now).toISOString()).toBe("2026-11-21T00:00:00.000Z");
  });
  it("handles duplicates, unsorted days, future dates and gaps", () => {
    const now = new Date("2026-01-01T00:01:00Z");
    expect(computeStreak(["2025-12-31", "2026-01-02", "2026-01-01", "2025-12-31", "2025-12-30"], now)).toBe(3);
    expect(computeStreak(["2025-12-31", "2025-12-29"], now)).toBe(1);
    expect(computeStreak(["2025-12-30"], now)).toBe(0);
    expect(computeStreak([], now)).toBe(0);
  });
  it("does not truncate streaks longer than 400 days", () => {
    const now = new Date("2026-11-21T12:00:00Z");
    const days = Array.from({ length: 450 }, (_, i) => {
      const date = new Date(now);
      date.setUTCDate(date.getUTCDate() - i);
      return utcDayKey(date);
    });
    expect(computeStreak(days, now)).toBe(450);
  });
  it("fills all seven calendar dates across a leap-day boundary", () => {
    const days = activityWeek([{ day: "2028-02-29", activities: 2, xp: 12, seconds: 80 }], new Date("2028-03-02T12:00:00Z"));
    expect(days).toHaveLength(7);
    expect(days[0].day).toBe("2028-02-25");
    expect(days[4]).toEqual({ day: "2028-02-29", activities: 2, xp: 12, seconds: 80 });
    expect(days[6]).toEqual({ day: "2028-03-02", activities: 0, xp: 0, seconds: 0 });
  });
});
