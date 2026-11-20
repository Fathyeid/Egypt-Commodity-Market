/** Writes the grammar topics as JSON for the video finder (npx tsx scripts/factory/export-topics.ts out.json). */
import { writeFileSync } from "node:fs";
import { TOPIC_SEEDS } from "../../src/content/topics";
import { LANGUAGE_NAMES } from "../../src/lib/factory/generate";

const out = process.argv[2] ?? "topics.json";
writeFileSync(
  out,
  JSON.stringify(
    TOPIC_SEEDS.map((t) => ({ id: t.id, language: t.language, languageName: LANGUAGE_NAMES[t.language]?.en ?? t.language, level: t.level, title: t.title.en })),
    null,
    1,
  ),
);
console.log(`Exported ${TOPIC_SEEDS.length} topics to ${out}`);
