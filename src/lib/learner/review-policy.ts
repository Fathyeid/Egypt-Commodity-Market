export const GRADES = ["again", "hard", "good", "easy"] as const;
export type Grade = (typeof GRADES)[number];
export type CardState = { intervalDays: number; ease: number; reps: number; lapses: number };

const DAY = 24 * 3600 * 1000;
const MIN_EASE = 1.3;

/** Next schedule for a card. "again" brings it back in 10 minutes. */
export function schedule(card: CardState, grade: Grade, now = new Date()): CardState & { dueAt: Date } {
  let { intervalDays, ease, reps, lapses } = card;
  if (grade === "again") {
    lapses += 1;
    reps = 0;
    ease = Math.max(MIN_EASE, ease - 0.2);
    intervalDays = 0;
    return { intervalDays, ease, reps, lapses, dueAt: new Date(now.getTime() + 10 * 60 * 1000) };
  }
  const q = grade === "hard" ? 3 : grade === "good" ? 4 : 5;
  ease = Math.max(MIN_EASE, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  if (reps === 0) intervalDays = grade === "easy" ? 4 : grade === "good" ? 1 : 0.5;
  else if (reps === 1) intervalDays = grade === "easy" ? 7 : grade === "good" ? 3 : 1.5;
  else intervalDays = Math.max(1, intervalDays * (grade === "hard" ? 1.2 : grade === "easy" ? ease * 1.3 : ease));
  intervalDays = Math.min(365, Math.round(intervalDays * 10) / 10);
  reps += 1;
  return { intervalDays, ease: Math.round(ease * 100) / 100, reps, lapses, dueAt: new Date(now.getTime() + intervalDays * DAY) };
}


/** Approximate recall budget, not a promise about time or memory. */
export const SESSION_MINUTES = [2, 5, 10] as const;
export type SessionMinutes = (typeof SESSION_MINUTES)[number];
export function sessionMinutes(value: unknown): SessionMinutes {
  const n = Number(value);
  return SESSION_MINUTES.find((m) => m === n) ?? 5;
}
export function sessionSize(minutes: SessionMinutes) { return Math.min(40, minutes * 4); }

export function intervalMinutes(card: CardState, grade: Grade) {
  const now = new Date(0);
  return Math.round((schedule(card, grade, now).dueAt.getTime() - now.getTime()) / 60000);
}
