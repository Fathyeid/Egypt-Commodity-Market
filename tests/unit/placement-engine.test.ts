import { describe, expect, it } from "vitest";
import { computeResult, estimateSkill, nextItem, TOTAL_ITEMS, type Response } from "@/lib/placement/engine";
import { getPlacementBank } from "@/content";

const bank = getPlacementBank("en");

/** Simulate a learner who answers correctly up to (and including) a true level index. */
function simulate(trueIdx: number, selfLevel: string) {
  const levels = ["A1", "A2", "B1", "B2", "C1"];
  const responses: Response[] = [];
  for (let i = 0; i < 50; i++) {
    const it = nextItem(bank, responses, selfLevel);
    if (!it) break;
    responses.push({ itemId: it.id, skill: it.skill, level: it.level, correct: levels.indexOf(it.level) <= trueIdx });
  }
  return responses;
}

describe("placement engine", () => {
  it("asks exactly TOTAL_ITEMS unique questions and then stops", () => {
    const r = simulate(2, "A1");
    expect(r).toHaveLength(TOTAL_ITEMS);
    expect(new Set(r.map((x) => x.itemId)).size).toBe(TOTAL_ITEMS);
    expect(nextItem(bank, r, "A1")).toBeNull();
  });

  it("starts at the self-rated level", () => {
    expect(nextItem(bank, [], "B1")?.level).toBe("B1");
    expect(nextItem(bank, [], "A0")?.level).toBe("A1");
  });

  it.each([
    [0, "A1"],
    [2, "B1"],
    [4, "C1"],
  ])("converges on the true level (idx %i → %s) from different starting points", (trueIdx, expected) => {
    for (const start of ["A0", "B1", "C1"]) {
      expect(computeResult(simulate(trueIdx, start)).overall).toBe(expected);
    }
  });

  it("a learner who misses everything is A0", () => {
    expect(computeResult(simulate(-1, "A2")).overall).toBe("A0");
  });

  it("estimateSkill picks the most consistent level, capped at the highest correct answer", () => {
    expect(estimateSkill([{ itemId: "x", skill: "grammar", level: "B1", correct: false }])).toBe("A0");
    expect(estimateSkill([{ itemId: "x", skill: "grammar", level: "A1", correct: false }])).toBe("A0");
    expect(estimateSkill([{ itemId: "x", skill: "grammar", level: "B2", correct: true }])).toBe("B2");
    // Noisy: A2✓ B1✗ A2✗ A1✓ → A1 and A2 tie; highest consistent level ≤ best correct = A2.
    const noisy = [["A2", true], ["B1", false], ["A2", false], ["A1", true]] as const;
    expect(estimateSkill(noisy.map(([level, correct], i) => ({ itemId: String(i), skill: "grammar" as const, level, correct })))).toBe("A2");
  });
});
