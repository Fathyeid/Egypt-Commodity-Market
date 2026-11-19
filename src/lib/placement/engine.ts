/**
 * Adaptive placement (staircase per skill).
 * Each skill asks ITEMS_PER_SKILL questions, starting at the learner's
 * self-rated level. The first answer moves two levels (to find the range
 * quickly), later answers one level. The estimate is the level most consistent
 * with all answers (fewest contradictions), never above the highest level
 * answered correctly. Simple, transparent, auditable.
 */
import { CEFR_ORDER, PLACEMENT_SKILLS, type Cefr, type PlacementItem, type Skill } from "@/content/types";

export const ITEMS_PER_SKILL = 4;
export const TOTAL_ITEMS = ITEMS_PER_SKILL * PLACEMENT_SKILLS.length;
export type Level = Cefr | "A0";
export type Response = { itemId: string; skill: Skill; level: Cefr; correct: boolean };

const clamp = (i: number) => Math.max(0, Math.min(CEFR_ORDER.length - 1, i));
const dist = (l: Cefr, idx: number) => Math.abs(CEFR_ORDER.indexOf(l) - idx);

export function startIndex(selfLevel: string): number {
  if (selfLevel === "A0") return 0;
  const i = CEFR_ORDER.indexOf(selfLevel as Cefr);
  return i < 0 ? 0 : i;
}

/** Next item to ask, or null when the test is finished. */
export function nextItem(bank: PlacementItem[], responses: Response[], selfLevel: string): PlacementItem | null {
  const asked = new Set(responses.map((r) => r.itemId));
  for (const skill of PLACEMENT_SKILLS) {
    const done = responses.filter((r) => r.skill === skill);
    if (done.length >= ITEMS_PER_SKILL) continue;
    let idx = startIndex(selfLevel);
    done.forEach((r, n) => {
      const step = n === 0 ? 2 : 1;
      idx = clamp(CEFR_ORDER.indexOf(r.level) + (r.correct ? step : -step));
    });
    const pool = bank.filter((it) => it.skill === skill && !asked.has(it.id));
    if (!pool.length) continue;
    // Closest unused item to the target level; ties prefer the lower level.
    pool.sort((a, b) => dist(a.level, idx) - dist(b.level, idx) || CEFR_ORDER.indexOf(a.level) - CEFR_ORDER.indexOf(b.level));
    return pool[0];
  }
  return null;
}

export function estimateSkill(responses: Response[]): Level | null {
  if (!responses.length) return null;
  const lv = (r: Response) => CEFR_ORDER.indexOf(r.level);
  // Candidate e ∈ [-1 (A0) … 4 (C1)]. A contradiction is a correct answer above e or a wrong answer at/below e.
  const violations = (e: number) => responses.filter((r) => (r.correct ? lv(r) > e : lv(r) <= e)).length;
  const cap = Math.max(-1, ...responses.filter((r) => r.correct).map(lv));
  let best = -1;
  for (let e = -1; e <= cap; e++) if (violations(e) <= violations(best)) best = e;
  return best < 0 ? "A0" : CEFR_ORDER[best];
}

export type PlacementResult = {
  skills: Record<Skill, { level: Level | null; correct: number; total: number }>;
  overall: Level;
};

const ALL_LEVELS: Level[] = ["A0", ...CEFR_ORDER];

export function computeResult(responses: Response[]): PlacementResult {
  const skills = {} as PlacementResult["skills"];
  for (const s of PLACEMENT_SKILLS) {
    const rs = responses.filter((r) => r.skill === s);
    skills[s] = { level: estimateSkill(rs), correct: rs.filter((r) => r.correct).length, total: rs.length };
  }
  // Overall = lower median of measured skills (conservative).
  const idxs = PLACEMENT_SKILLS.map((s) => skills[s].level)
    .filter((l): l is Level => !!l)
    .map((l) => ALL_LEVELS.indexOf(l))
    .sort((a, b) => a - b);
  const overall = idxs.length ? ALL_LEVELS[idxs[Math.floor((idxs.length - 1) / 2)]] : "A0";
  return { skills, overall };
}
