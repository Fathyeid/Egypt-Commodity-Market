import type { L10n } from "../types";

/** A hand-written grammar topic. Seeded once; after that the admin panel owns it. */
export type TopicSeed = {
  id: string;
  language: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  title: L10n;
  explanation: L10n;
};

export const topic = (language: string, level: TopicSeed["level"], slug: string, title: L10n, explanation: L10n): TopicSeed => ({
  id: `${language}-${level.toLowerCase()}-g-${slug}`,
  language,
  level,
  title,
  explanation,
});

export const t = (ar: string, en: string): L10n => ({ ar, en });
