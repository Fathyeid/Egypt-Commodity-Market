/**
 * Imports factory lessons (generated from data/tatoeba/<lang>.jsonl.gz) as drafts.
 * Re-runs only when a language's corpus or the generator changed. Keeps each lesson's
 * review status, never touches rejected or hand-written lessons.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { and, eq, like, ne, notInArray, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { contentImports, curriculumCourses, curriculumLessons, curriculumUnits } from "./schema";
import { generateCourses, type CorpusRow } from "../factory/generate";
import { FACTORY_LEVELS } from "../factory/syllabus";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

const FACTORY_POSITION = 1000; // after any hand-written lessons in the same course
const BATCH = 200;

export function readCorpus(file: string): CorpusRow[] {
  return gunzipSync(readFileSync(file))
    .toString("utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CorpusRow);
}

/**
 * FACTORY_STATUS=draft keeps new lessons hidden until an admin approves them (used by CI and tests);
 * the default publishes them straight away, as the project owner asked.
 */
export function factoryStatus(env: Record<string, string | undefined> = process.env): "draft" | "published" {
  return env.FACTORY_STATUS === "draft" ? "draft" : "published";
}

export async function seedFactoryCurriculum(db: Db, dir = join(process.cwd(), "data/tatoeba"), log = console.log, status = factoryStatus()) {
  if (!existsSync(dir)) return log("No factory corpus found (data/tatoeba); skipping");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".jsonl.gz")).sort()) {
    const language = file.replace(".jsonl.gz", "");
    const raw = readFileSync(join(dir, file));
    const hash = createHash("sha256").update(raw).update(`factory-v3:${status}`).digest("hex");
    const source = `tatoeba:${language}`;
    const [prev] = await db.select().from(contentImports).where(eq(contentImports.source, source));
    if (prev?.hash === hash) {
      log(`${source}: unchanged (${prev.lessons} lessons)`);
      continue;
    }
    const courses = generateCourses(language, readCorpus(join(dir, file)));
    let count = 0;
    for (const course of courses) {
      await db
        .insert(curriculumCourses)
        .values({ id: course.id, language, level: course.level, title: course.title, sortOrder: FACTORY_LEVELS.indexOf(course.level) })
        .onConflictDoNothing();
      for (const [ui, unit] of course.units.entries()) {
        await db
          .insert(curriculumUnits)
          .values({ id: unit.id, courseId: course.id, position: FACTORY_POSITION + ui, title: unit.title })
          .onConflictDoUpdate({ target: curriculumUnits.id, set: { title: unit.title, position: FACTORY_POSITION + ui } });
      }
      // Lesson order: unit by unit, so the course reads theme after theme.
      const rows = course.units.flatMap((u) => u.lessons).map((l, i) => ({
        id: l.id,
        courseId: course.id,
        unitId: l.unitId,
        position: FACTORY_POSITION + i,
        title: l.title,
        goal: l.goal,
        content: l.content,
        attribution: l.attribution,
        source: "factory",
        status,
      }));
      for (let i = 0; i < rows.length; i += BATCH) {
        await db
          .insert(curriculumLessons)
          .values(rows.slice(i, i + BATCH))
          .onConflictDoUpdate({
            target: curriculumLessons.id,
            set: {
              title: sql`excluded.title`,
              goal: sql`excluded.goal`,
              content: sql`excluded.content`,
              attribution: sql`excluded.attribution`,
              position: sql`excluded.position`,
              unitId: sql`excluded.unit_id`,
              // Keep a reviewed status; a draft follows the import mode.
              status: sql`case when ${curriculumLessons.status} = 'draft' then excluded.status else ${curriculumLessons.status} end`,
              updatedAt: new Date(),
            },
            // Refresh generated content; lessons an admin rejected stay as they are.
            setWhere: and(eq(curriculumLessons.source, "factory"), ne(curriculumLessons.status, "rejected")),
          });
      }
      count += rows.length;
    }
    // Drop generated lessons the new corpus no longer produces (rejected ones stay), then empty factory units.
    const keep = courses.flatMap((c) => c.units.flatMap((u) => u.lessons.map((l) => l.id)));
    const stale = await db
      .delete(curriculumLessons)
      .where(
        and(
          eq(curriculumLessons.source, "factory"),
          ne(curriculumLessons.status, "rejected"),
          like(curriculumLessons.id, `${language}-%`),
          keep.length ? notInArray(curriculumLessons.id, keep) : sql`true`,
        ),
      )
      .returning({ id: curriculumLessons.id });
    const used = db.selectDistinct({ id: curriculumLessons.unitId }).from(curriculumLessons);
    await db.delete(curriculumUnits).where(and(like(curriculumUnits.id, `${language}-%-fu-%`), notInArray(curriculumUnits.id, used)));
    if (stale.length) log(`${source}: removed ${stale.length} outdated lessons`);
    await db
      .insert(contentImports)
      .values({ source, hash, lessons: count })
      .onConflictDoUpdate({ target: contentImports.source, set: { hash, lessons: count, importedAt: new Date() } });
    log(`${source}: imported ${count} ${status} lessons in ${courses.length} levels`);
  }
}
