/** Writes topics and unit themes as JSON for the channel video matcher (npx tsx scripts/factory/export-video-input.ts out.json). */
import { writeFileSync } from "node:fs";
import { TOPIC_SEEDS } from "../../src/content/topics";
import { LANGUAGE_NAMES } from "../../src/lib/factory/generate";
import { THEMES, MIXED } from "../../src/lib/factory/syllabus";

const out = process.argv[2] ?? "video-input.json";
writeFileSync(
  out,
  JSON.stringify({
    languages: Object.fromEntries(Object.entries(LANGUAGE_NAMES).map(([k, v]) => [k, v.en])),
    topics: TOPIC_SEEDS.map((t) => ({ id: t.id, language: t.language, level: t.level, title: t.title.en })),
    themes: [...THEMES, MIXED].map((t) => ({ id: t.id, title: t.title.en, words: t.words })),
  }),
);
console.log(`Exported ${TOPIC_SEEDS.length} topics and ${THEMES.length + 1} themes to ${out}`);
