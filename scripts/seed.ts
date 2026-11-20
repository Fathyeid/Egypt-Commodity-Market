import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql as dsql } from "drizzle-orm";
import { languages } from "../src/lib/db/schema";
import { LAUNCH_LANGUAGES } from "../src/lib/db/languages";
import { seedHandwrittenCurriculum, HANDWRITTEN_COURSES } from "../src/lib/db/seed-curriculum";
import { seedFactoryCurriculum } from "../src/lib/db/seed-factory";
import { seedTopics } from "../src/lib/db/seed-topics";

async function main() {
  const client = postgres(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client);
  await db
    .insert(languages)
    .values(LAUNCH_LANGUAGES.map((l, i) => ({ ...l, sortOrder: i })))
    .onConflictDoUpdate({
      target: languages.code,
      set: {
        nameEn: dsql`excluded.name_en`,
        nameAr: dsql`excluded.name_ar`,
        nativeName: dsql`excluded.native_name`,
        glyph: dsql`excluded.glyph`,
        script: dsql`excluded.script`,
        direction: dsql`excluded.direction`,
        sttLocale: dsql`excluded.stt_locale`,
        sortOrder: dsql`excluded.sort_order`,
      },
    });
  console.log(`Seeded ${LAUNCH_LANGUAGES.length} languages`);
  await seedHandwrittenCurriculum(db);
  console.log(`Seeded ${HANDWRITTEN_COURSES.length} hand-written courses`);
  await seedFactoryCurriculum(db);
  const topics = await seedTopics(db);
  console.log(`Seeded ${topics.topics} grammar topics; attached to ${topics.lessons} lessons`);
  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
