/**
 * Learning content model. Content lives in versioned TypeScript files for now
 * (reviewable in PRs); the admin panel (Phase 7) will move authoring into the DB.
 * Answers never leave the server: see toPublic* helpers in ./index.ts.
 */
export type Cefr = "A1" | "A2" | "B1" | "B2" | "C1";
export const CEFR_ORDER: Cefr[] = ["A1", "A2", "B1", "B2", "C1"];
export type Skill = "vocabulary" | "grammar" | "reading" | "listening";
export const PLACEMENT_SKILLS: Skill[] = ["vocabulary", "grammar", "reading", "listening"];

/** Text shown to the learner in their interface language. */
export type L10n = { ar: string; en: string };

export type PlacementItem = {
  id: string;
  skill: Skill;
  level: Cefr;
  /** Reading passage, or text spoken by the browser voice for listening items. */
  passage?: string;
  audio?: string;
  prompt: string;
  options: string[];
  answer: number;
  /** Hint in the learner's language (e.g. the sentence's meaning), for generated items. */
  note?: string;
  /** Options are meanings in the learner's language rather than target-language text. */
  nativeOptions?: boolean;
};

export type Exercise =
  | { id: string; type: "mcq"; prompt: string; hint?: L10n; options: string[]; answer: number; explain?: L10n; tag?: string }
  | { id: string; type: "fill"; prompt: string; hint?: L10n; answers: string[]; explain?: L10n; tag?: string }
  | { id: string; type: "order"; hint?: L10n; words: string[]; answers: string[]; explain?: L10n; tag?: string }
  | { id: string; type: "match"; hint?: L10n; pairs: [string, L10n][]; explain?: L10n; tag?: string }
  | { id: string; type: "listen"; audio: string; prompt: L10n; options: string[]; answer: number; explain?: L10n; tag?: string }
  | { id: string; type: "dictation"; audio: string; answers: string[]; explain?: L10n; tag?: string }
  | { id: string; type: "translate"; prompt: L10n; answers: string[]; explain?: L10n; tag?: string };

export type VocabItem = { term: string; meaning: L10n; example?: string };

export type Lesson = {
  id: string;
  title: L10n;
  goal: L10n;
  explanation: L10n;
  vocabulary: VocabItem[];
  pronunciation: { text: string; tip: L10n }[];
  examples: { text: string; meaning: L10n }[];
  grammar: { title: L10n; body: L10n; table?: string[][] };
  exercises: Exercise[];
  quiz: Exercise[];
  review: L10n[];
};

export type Unit = { id: string; title: L10n; lessons: Lesson[] };
export type Course = { id: string; language: string; level: Cefr; title: L10n; units: Unit[] };
