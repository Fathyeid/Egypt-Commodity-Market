import { describe, expect, it } from "vitest";
import { generateCourses, type CorpusRow } from "@/lib/factory/generate";
import { gradeExercise, toPublicExercise } from "@/content";
import type { Exercise, Lesson } from "@/content/types";

const SUBJECTS = ["Ich", "Du", "Er", "Sie", "Wir", "Ihr"];
const VERBS = ["esse", "trinke", "kaufe", "sehe", "suche", "mag", "koche", "brauche"];
const OBJECTS = ["Brot", "Wasser", "Kaffee", "den Zug", "das Haus", "die Katze", "Musik", "den Bahnhof", "Tee", "Fisch"];
const EN_OBJ = ["bread", "water", "coffee", "the train", "the house", "the cat", "music", "the station", "tea", "fish"];

/** A synthetic German corpus big enough for every level (real data comes from Tatoeba). */
function corpus(n: number): CorpusRow[] {
  const rows: CorpusRow[] = [];
  for (let i = 0; i < n; i++) {
    const s = SUBJECTS[i % SUBJECTS.length];
    const v = VERBS[Math.floor(i / 6) % VERBS.length];
    const o = OBJECTS[Math.floor(i / 48) % OBJECTS.length];
    const extra = Math.floor(i / 480);
    const t = `${s} ${v} ${o}${extra ? ` heute ${extra}` : ""}.`;
    rows.push({ id: i + 1, t, u: "tester", en: `${s} ${v} ${EN_OBJ[Math.floor(i / 48) % 10]} ${i}.`, enId: 100000 + i, ar: i % 2 ? `جملة ${i}` : undefined, arId: i % 2 ? 200000 + i : undefined, d: i / n });
  }
  return rows;
}

function integrity(lesson: Lesson, language: string) {
  const all: Exercise[] = [...lesson.exercises, ...lesson.quiz];
  expect(new Set(lesson.exercises.map((e) => e.id)).size).toBe(lesson.exercises.length);
  expect(new Set(lesson.quiz.map((e) => e.id)).size).toBe(lesson.quiz.length);
  for (const ex of all) {
    let good: number | string | string[];
    if (ex.type === "mcq" || ex.type === "listen") {
      expect(new Set(ex.options).size, `${lesson.id}/${ex.id} options unique`).toBe(ex.options.length);
      good = ex.answer;
    } else if (ex.type === "match") {
      expect(new Set(ex.pairs.map((p) => p[1].en)).size).toBe(ex.pairs.length);
      good = ex.pairs.map((p) => p[1].en);
    } else if (ex.type === "order") {
      expect([...ex.words].sort().join(" ")).toBe(ex.answers[0].split(" ").sort().join(" "));
      good = ex.answers[0];
    } else {
      good = ex.answers[0];
    }
    expect(gradeExercise(ex, good, language).correct, `${lesson.id}/${ex.id}`).toBe(true);
    expect(gradeExercise(ex, "definitely wrong", language).correct).toBe(false);
    expect(JSON.stringify(toPublicExercise(ex, lesson.id))).not.toContain(`"answer"`);
  }
}

describe("content factory", () => {
  const rows = corpus(24000);
  const courses = generateCourses("de", rows);

  it("builds six levels, capped at 300 lessons each, with stable unique ids", () => {
    expect(courses.map((c) => c.level)).toEqual(["A1", "A2", "B1", "B2", "C1", "C2"]);
    const ids = courses.flatMap((c) => c.units.flatMap((u) => u.lessons.map((l) => l.id)));
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of courses) {
      const n = c.units.reduce((s, u) => s + u.lessons.length, 0);
      expect(n).toBeGreaterThan(0);
      expect(n).toBeLessThanOrEqual(300);
    }
    expect(generateCourses("de", rows)[0].units[0].lessons[0]).toEqual(courses[0].units[0].lessons[0]);
  });

  it("every lesson is complete, answerable and attributed", () => {
    for (const c of courses.slice(0, 2)) {
      for (const u of c.units) {
        for (const l of u.lessons.slice(0, 5)) {
          const lesson = { id: l.id, title: l.title, goal: l.goal, ...l.content } as Lesson;
          expect(lesson.examples.length).toBeGreaterThanOrEqual(3);
          expect(lesson.exercises.length).toBeGreaterThanOrEqual(4);
          expect(lesson.quiz.length).toBeGreaterThanOrEqual(4);
          integrity(lesson, "de");
          expect(l.attribution.license).toBe("CC BY 2.0 FR");
          expect(l.attribution.sentences.length).toBeGreaterThanOrEqual(10);
          expect(l.unitId.startsWith(`de-${c.level.toLowerCase()}-fu-`)).toBe(true);
        }
      }
    }
  });

  it("falls back to the English meaning when no Arabic translation exists", () => {
    const l = courses[0].units[0].lessons[0];
    for (const e of l.content.examples) expect(e.meaning.ar).toBeTruthy();
  });

  it("works for a language without spaces (no word-order or cloze exercises)", () => {
    const zh: CorpusRow[] = Array.from({ length: 600 }, (_, i) => ({ id: i + 1, t: `我喜欢${"茶水咖啡面包米饭"[i % 8]}${i}。`, en: `I like tea ${i}.`, enId: 9000 + i, d: i / 600 }));
    const [a1] = generateCourses("zh", zh);
    const l = a1.units[0].lessons[0];
    expect([...l.content.exercises, ...l.content.quiz].some((e) => e.type === "order" || e.type === "fill")).toBe(false);
    integrity({ id: l.id, title: l.title, goal: l.goal, ...l.content } as Lesson, "zh");
  });
});
