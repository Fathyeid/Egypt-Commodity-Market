import { describe, expect, it } from "vitest";
import { getPlacementBank, getPlacementItem, placementAvailable } from "@/lib/learner/placement-bank";

const GENERATED = ["fr", "es", "it", "pt", "tr", "ru", "zh", "ja", "ko", "ar"];

describe("placement banks for every language", () => {
  it("keeps the hand-written banks for English and German", () => {
    expect(getPlacementBank("en")[0].id.startsWith("en-")).toBe(true);
    expect(getPlacementBank("de").some((i) => i.id.includes("-auto-"))).toBe(false);
  });

  for (const lang of GENERATED) {
    it(`${lang}: 2 items per skill per level, well-formed and deterministic`, () => {
      expect(placementAvailable(lang)).toBe(true);
      const bank = getPlacementBank(lang);
      expect(bank).toHaveLength(40);
      for (const level of ["A1", "A2", "B1", "B2", "C1"])
        for (const skill of ["vocabulary", "grammar", "reading", "listening"])
          expect(bank.filter((i) => i.level === level && i.skill === skill)).toHaveLength(2);
      for (const item of bank) {
        expect(item.options).toHaveLength(4);
        expect(new Set(item.options).size).toBe(4);
        expect(item.answer).toBeGreaterThanOrEqual(0);
        expect(item.answer).toBeLessThan(4);
        if (item.skill === "listening") expect(item.audio).toBeTruthy();
        if (item.skill === "reading") expect(item.passage).toBeTruthy();
        expect(getPlacementItem(lang, item.id)).toBe(item);
      }
      expect(new Set(bank.map((i) => i.id)).size).toBe(40);
    });
  }
});
