/** UTC calendar helpers shared by the dashboard and daily-goal queries.
 * Keep the existing UTC policy explicit until learner timezone settings exist.
 */
export function utcDayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function utcDayStart(now: Date): Date {
  return new Date(`${utcDayKey(now)}T00:00:00.000Z`);
}

/** Consecutive days ending today or yesterday. Order and duplicates do not matter. */
export function computeStreak(days: string[], now = new Date()): number {
  const active = new Set(days);
  const cursor = utcDayStart(now);
  if (!active.has(utcDayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (active.has(utcDayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export type ActivityDay = { day: string; xp: number; seconds: number; activities: number };

/** Seven calendar days, oldest first. Empty days stay visible, including today. */
export function activityWeek(days: ActivityDay[], now = new Date()): ActivityDay[] {
  const indexed = new Map(days.map((day) => [day.day, day]));
  return Array.from({ length: 7 }, (_, i) => {
    const date = utcDayStart(now);
    date.setUTCDate(date.getUTCDate() - 6 + i);
    const day = utcDayKey(date);
    return indexed.get(day) ?? { day, xp: 0, seconds: 0, activities: 0 };
  });
}
