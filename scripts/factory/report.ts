/** Prints how many factory lessons each language gets per level (npx tsx scripts/factory/report.ts [lang]). */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { readCorpus } from "../../src/lib/db/seed-factory";
import { generateCourses } from "../../src/lib/factory/generate";

const dir = join(process.cwd(), "data/tatoeba");
const only = process.argv[2];
for (const f of readdirSync(dir).filter((x) => x.endsWith(".jsonl.gz")).sort()) {
  const lang = f.replace(".jsonl.gz", "");
  if (only && only !== lang) continue;
  const courses = generateCourses(lang, readCorpus(join(dir, f)));
  const per = courses.map((c) => `${c.level}:${c.units.reduce((s, u) => s + u.lessons.length, 0)}/${c.units.length}u`).join(" ");
  console.log(`${lang} ${per}`);
  if (only) {
    for (const c of courses) {
      const l = c.units[0].lessons[0];
      console.log(`\n## ${c.level} ${l.id}`);
      for (const e of l.content.examples.slice(0, 3)) console.log(`  ${e.text}  =  ${e.meaning.ar} | ${e.meaning.en}`);
    }
  }
}
