import type { Course, Exercise, L10n, Lesson, PlacementItem } from "./types";
import { enPlacement } from "./placement/en";
import { dePlacement } from "./placement/de";
import { enA1 } from "./courses/en-a1";
import { deA1 } from "./courses/de-a1";
import { matchesAny } from "@/lib/grading";
import { enTexts } from "./texts/en";
import { deTexts } from "./texts/de";
import { frTexts } from "./texts/fr";
import { esTexts } from "./texts/es";
import { itTexts } from "./texts/it";
import { ptTexts } from "./texts/pt";
import { trTexts } from "./texts/tr";
import { ruTexts } from "./texts/ru";
import { zhTexts } from "./texts/zh";
import { jaTexts } from "./texts/ja";
import { koTexts } from "./texts/ko";
import { arTexts } from "./texts/ar";
import type { TextItem } from "./texts/types";

const TEXTS: TextItem[] = [...enTexts, ...deTexts, ...frTexts, ...esTexts, ...itTexts, ...ptTexts, ...trTexts, ...ruTexts, ...zhTexts, ...jaTexts, ...koTexts, ...arTexts];
export const textsFor = (language: string, kind: TextItem["kind"]) => TEXTS.filter((x) => x.language === language && x.kind === kind);
export const findText = (id: string) => TEXTS.find((x) => x.id === id) ?? null;
export type PublicTextItem = Omit<TextItem, "questions"> & { questions: { id: string; prompt: TextItem["questions"][number]["prompt"]; options: string[] }[] };
export function toPublicText(item: TextItem): PublicTextItem {
  return { ...item, questions: item.questions.map(({ id, prompt, options }) => ({ id, prompt, options })) };
}

const PLACEMENT: Record<string, PlacementItem[]> = { en: enPlacement, de: dePlacement };
const COURSES: Course[] = [enA1, deA1];

export const placementAvailable = (language: string) => language in PLACEMENT;
export const getPlacementBank = (language: string) => PLACEMENT[language] ?? [];
export const getPlacementItem = (language: string, id: string) => getPlacementBank(language).find((i) => i.id === id) ?? null;

export const coursesFor = (language: string) => COURSES.filter((c) => c.language === language);

export function findLesson(lessonId: string): { course: Course; lesson: Lesson; unitIndex: number; lessonIndex: number } | null {
  for (const course of COURSES) {
    for (const [unitIndex, unit] of course.units.entries()) {
      const lessonIndex = unit.lessons.findIndex((l) => l.id === lessonId);
      if (lessonIndex >= 0) return { course, lesson: unit.lessons[lessonIndex], unitIndex, lessonIndex };
    }
  }
  return null;
}

export const lessonIds = (course: Course) => course.units.flatMap((u) => u.lessons.map((l) => l.id));

/* ------------------------------------------------------------------ */
/* Public (answer-free) shapes sent to the browser                     */
/* ------------------------------------------------------------------ */

/** Deterministic shuffle so server and client render the same order. */
function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type PublicPlacementItem = Omit<PlacementItem, "answer">;
export function toPublicItem(item: PlacementItem): PublicPlacementItem {
  const { id, skill, level, passage, audio, prompt, options, note, nativeOptions } = item;
  return { id, skill, level, passage, audio, prompt, options, note, nativeOptions };
}

export type PublicExercise =
  | { id: string; type: "mcq"; prompt: string; hint?: L10n; options: string[] }
  | { id: string; type: "fill"; prompt: string; hint?: L10n }
  | { id: string; type: "order"; hint?: L10n; words: string[] }
  | { id: string; type: "match"; hint?: L10n; left: string[]; right: L10n[] }
  | { id: string; type: "listen"; audio: string; prompt: L10n; options: string[] }
  | { id: string; type: "dictation"; audio: string }
  | { id: string; type: "translate"; prompt: L10n };

export function toPublicExercise(ex: Exercise, seed: string): PublicExercise {
  switch (ex.type) {
    case "mcq":
      return { id: ex.id, type: "mcq", prompt: ex.prompt, hint: ex.hint, options: ex.options };
    case "fill":
      return { id: ex.id, type: "fill", prompt: ex.prompt, hint: ex.hint };
    case "order":
      return { id: ex.id, type: "order", hint: ex.hint, words: seededShuffle(ex.words, seed + ex.id) };
    case "match":
      return { id: ex.id, type: "match", hint: ex.hint, left: ex.pairs.map((p) => p[0]), right: seededShuffle(ex.pairs.map((p) => p[1]), seed + ex.id) };
    case "listen":
      return { id: ex.id, type: "listen", audio: ex.audio, prompt: ex.prompt, options: ex.options };
    case "dictation":
      return { id: ex.id, type: "dictation", audio: ex.audio };
    case "translate":
      return { id: ex.id, type: "translate", prompt: ex.prompt };
  }
}

export type PublicLesson = Omit<Lesson, "exercises" | "quiz"> & { exercises: PublicExercise[]; quiz: PublicExercise[] };

export function toPublicLesson(lesson: Lesson): PublicLesson {
  return {
    ...lesson,
    exercises: lesson.exercises.map((e) => toPublicExercise(e, lesson.id)),
    quiz: lesson.quiz.map((e) => toPublicExercise(e, lesson.id + ":quiz")),
  };
}

/* ------------------------------------------------------------------ */
/* Grading (server side)                                               */
/* ------------------------------------------------------------------ */

/** Answer payload from the client: option index, free text, or a match mapping (left index → right L10n en text). */
export type ExerciseAnswer = number | string | string[];

export type GradeResult = { correct: boolean; expected: string; explain?: Exercise["explain"] };

export function gradeExercise(ex: Exercise, answer: ExerciseAnswer, language: string): GradeResult {
  switch (ex.type) {
    case "mcq":
    case "listen":
      return { correct: answer === ex.answer, expected: ex.options[ex.answer], explain: ex.explain };
    case "fill":
    case "translate":
    case "dictation":
      return { correct: typeof answer === "string" && matchesAny(answer, ex.answers, language), expected: ex.answers[0], explain: ex.explain };
    case "order":
      return { correct: typeof answer === "string" && matchesAny(answer, ex.answers, language), expected: ex.answers[0], explain: ex.explain };
    case "match": {
      const ok = Array.isArray(answer) && answer.length === ex.pairs.length && ex.pairs.every((p, i) => answer[i] === p[1].en);
      return { correct: ok, expected: ex.pairs.map((p) => `${p[0]} = ${p[1].en}`).join(" · "), explain: ex.explain };
    }
  }
}
