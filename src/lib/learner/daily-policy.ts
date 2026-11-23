export type DailyLesson = { id: string; score?: number };
/** Repair a weak result before adding new material. Zero is not a passing score. */
export function chooseDailyLesson(lessons: DailyLesson[]) {
  return lessons.find(l => l.score !== undefined && l.score < 70) ?? lessons.find(l => l.score === undefined) ?? null;
}
export function dailyReviewLimit(minutes: number) { return minutes <= 10 ? 4 : minutes <= 20 ? 8 : 12; }
