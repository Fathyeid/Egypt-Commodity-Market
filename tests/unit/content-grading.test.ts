import { describe, expect, it } from "vitest";
import { coursesFor, getPlacementBank, gradeExercise, toPublicExercise, toPublicItem, toPublicLesson } from "@/content";
import { CEFR_ORDER, PLACEMENT_SKILLS, type Exercise } from "@/content/types";
import { matchesAny, normalize } from "@/lib/grading";

describe("grading", () => {
  it("is lenient on case, spacing, punctuation and apostrophes", () => {
    expect(matchesAny("  i’m   SARA. ", ["I'm Sara"])).toBe(true);
    expect(matchesAny("Im Sara", ["I'm Sara"])).toBe(false);
  });
  it("accepts German umlaut spellings", () => {
    expect(matchesAny("zwoelf", ["zwölf"], "de")).toBe(true);
    expect(matchesAny("Ich heisse Omar", ["Ich heiße Omar"], "de")).toBe(true);
    expect(normalize("Grüße", "de")).toBe("gruesse");
  });
  it("rejects empty answers", () => {
    expect(matchesAny("   ", [""])).toBe(false);
  });
});

for (const language of ["en", "de"]) {
  describe(`content integrity: ${language}`, () => {
    const bank = getPlacementBank(language);
    it("placement bank has 2 valid items per skill per level with unique ids", () => {
      expect(new Set(bank.map((i) => i.id)).size).toBe(bank.length);
      for (const s of PLACEMENT_SKILLS) for (const l of CEFR_ORDER) expect(bank.filter((i) => i.skill === s && i.level === l)).toHaveLength(2);
      for (const i of bank) {
        expect(i.answer).toBeGreaterThanOrEqual(0);
        expect(i.answer).toBeLessThan(i.options.length);
        if (i.skill === "reading") expect(i.passage).toBeTruthy();
        if (i.skill === "listening") expect(i.audio).toBeTruthy();
        expect(toPublicItem(i)).not.toHaveProperty("answer");
      }
    });

    const course = coursesFor(language)[0];
    const lessons = course.units.flatMap((u) => u.lessons);
    it("every lesson has all 8 sections filled", () => {
      expect(lessons.length).toBeGreaterThanOrEqual(6);
      expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
      for (const l of lessons) {
        expect(l.explanation.ar && l.explanation.en).toBeTruthy();
        expect(l.vocabulary.length).toBeGreaterThanOrEqual(5);
        expect(l.pronunciation.length).toBeGreaterThan(0);
        expect(l.examples.length).toBeGreaterThanOrEqual(3);
        expect(l.grammar.body.ar).toBeTruthy();
        expect(l.exercises.length).toBeGreaterThanOrEqual(4);
        expect(l.quiz.length).toBeGreaterThanOrEqual(4);
        expect(l.review.length).toBeGreaterThanOrEqual(3);
      }
    });

    it("every exercise is well-formed, answerable, and leaks no answers when public", () => {
      for (const l of lessons) {
        const all: Exercise[] = [...l.exercises, ...l.quiz];
        expect(new Set(l.exercises.map((e) => e.id)).size).toBe(l.exercises.length);
        expect(new Set(l.quiz.map((e) => e.id)).size).toBe(l.quiz.length);
        for (const ex of all) {
          const pub = JSON.stringify(toPublicExercise(ex, l.id));
          // A correct answer graded correct:
          let good: number | string | string[];
          if (ex.type === "mcq" || ex.type === "listen") {
            expect(ex.answer).toBeLessThan(ex.options.length);
            good = ex.answer;
          } else if (ex.type === "match") {
            expect(new Set(ex.pairs.map((p) => p[1].en)).size).toBe(ex.pairs.length);
            good = ex.pairs.map((p) => p[1].en);
          } else if (ex.type === "order") {
            expect([...ex.words].sort().join(" ")).toBe(ex.answers[0].split(" ").sort().join(" "));
            good = ex.answers[0];
          } else {
            good = ex.answers[0];
            if (ex.type !== "dictation") expect(pub).not.toContain(`"answers"`);
          }
          expect(gradeExercise(ex, good, language).correct, `${l.id}/${ex.id}`).toBe(true);
          expect(gradeExercise(ex, "definitely wrong", language).correct).toBe(false);
          expect(pub).not.toContain(`"answer"`);
        }
      }
      expect(JSON.stringify(toPublicLesson(lessons[0]).quiz)).not.toContain('"answers"');
    });
  });
}
