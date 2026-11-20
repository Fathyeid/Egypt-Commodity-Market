import { describe, expect, it } from "vitest";
import { buildCheckpoint, CHECKPOINT_SIZE } from "@/lib/learner/checkpoint";
import { deA1 } from "@/content/courses/de-a1";

describe("unit checkpoint", () => {
  it("draws up to 10 unique questions across the unit's lessons, deterministically", () => {
    const lessons = deA1.units[0].lessons;
    const cp = buildCheckpoint(lessons);
    expect(cp.length).toBe(Math.min(CHECKPOINT_SIZE, lessons.reduce((n, l) => n + l.quiz.length, 0)));
    expect(new Set(cp.map((e) => e.id)).size).toBe(cp.length);
    expect(cp[0].id).toBe(`l0-${lessons[0].quiz[0].id}`);
    expect(cp[1].id).toBe(`l1-${lessons[1].quiz[0].id}`);
    expect(buildCheckpoint(lessons)).toEqual(cp);
  });
});
