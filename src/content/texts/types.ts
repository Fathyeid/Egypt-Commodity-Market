import type { Cefr, L10n } from "../types";

/** A graded text used by the Listening and Reading centres (original content, written for Lisan). */
export type TextItem = {
  id: string;
  language: string;
  kind: "listening" | "reading";
  genre: "dialogue" | "story" | "news" | "interview" | "article";
  level: Cefr;
  title: L10n;
  /** Lines; for dialogues each line is "Speaker: text". */
  lines: string[];
  /** Lower-case word/phrase → meaning, used by the tap-to-translate popover. */
  glossary: Record<string, L10n>;
  questions: { id: string; prompt: L10n; options: string[]; answer: number }[];
};
