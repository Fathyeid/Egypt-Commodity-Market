import { describe, expect, it } from "vitest";
import { TOPIC_SEEDS } from "@/content/topics";

describe("grammar topics", () => {
  it("have unique ids and both languages filled, for every level of each written language", () => {
    expect(new Set(TOPIC_SEEDS.map((t) => t.id)).size).toBe(TOPIC_SEEDS.length);
    for (const lang of ["en", "de", "fr", "es", "it", "pt", "tr", "ru", "zh", "ja", "ko", "ar"]) {
      for (const level of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
        expect(TOPIC_SEEDS.filter((t) => t.language === lang && t.level === level).length, `${lang} ${level}`).toBeGreaterThanOrEqual(5);
      }
    }
    for (const t of TOPIC_SEEDS) {
      expect(t.id.startsWith(`${t.language}-${t.level.toLowerCase()}-g-`)).toBe(true);
      for (const x of [t.title.ar, t.title.en, t.explanation.ar, t.explanation.en]) expect(x.trim().length).toBeGreaterThan(3);
      expect(t.explanation.ar).toMatch(/[؀-ۿ]/);
    }
  });
});
