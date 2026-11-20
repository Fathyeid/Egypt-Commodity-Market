import { afterAll, describe, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import * as schema from "@/lib/db/schema";
import { seedFactoryCurriculum } from "@/lib/db/seed-factory";
import { coursesForLanguage } from "@/lib/curriculum";

const sql = postgres(process.env.DATABASE_URL!, { max: 2, onnotice: () => {} });
const db = drizzle(sql, { schema });
const cleanup = async () => {
  await sql`delete from curriculum_courses where language = 'fr'`;
  await sql`delete from content_imports where source = 'tatoeba:fr'`;
};
afterAll(async () => {
  await cleanup();
  await sql.end();
});

function writeCorpus(dir: string, n: number, suffix = "") {
  const lines = Array.from({ length: n }, (_, i) =>
    JSON.stringify({ id: i + 1, t: `Je mange du pain ${i}${suffix}.`, u: "tester", en: `I eat bread ${i}.`, enId: 50000 + i, d: i / n }),
  );
  writeFileSync(join(dir, "fr.jsonl.gz"), gzipSync(lines.join("\n")));
}

describe("factory import (database)", () => {
  it("imports drafts, skips unchanged corpora and keeps reviewed lessons", async () => {
    await cleanup();
    const dir = mkdtempSync(join(tmpdir(), "corpus-"));
    writeCorpus(dir, 600);
    const logs: string[] = [];
    await seedFactoryCurriculum(db, dir, (m) => logs.push(m));
    const [{ n }] = await sql`select count(*)::int as n from curriculum_lessons where course_id like 'fr-%' and status = 'draft' and source = 'factory'`;
    expect(n).toBeGreaterThan(30);
    expect(await coursesForLanguage(db, "fr")).toEqual([]); // drafts are invisible to learners

    await seedFactoryCurriculum(db, dir, (m) => logs.push(m));
    expect(logs.at(-1)).toContain("unchanged");

    const [first] = await sql`select id, content from curriculum_lessons where course_id = 'fr-a1' order by position limit 1`;
    await sql`update curriculum_lessons set status = 'published' where id = ${first.id}`;
    writeCorpus(dir, 600, " !");
    await seedFactoryCurriculum(db, dir, (m) => logs.push(m));
    const [after] = await sql`select content, status from curriculum_lessons where id = ${first.id}`;
    expect(after.status).toBe("published");
    expect(after.content).toEqual(first.content); // an approved lesson is never overwritten
    // A smaller corpus drops outdated drafts but keeps the reviewed lesson.
    writeCorpus(dir, 300, " zzz");
    await seedFactoryCurriculum(db, dir, (m) => logs.push(m));
    expect(logs.some((m) => m.includes("outdated drafts"))).toBe(true);
    const [{ total }] = await sql`select count(*)::int as total from curriculum_lessons where course_id like 'fr-%'`;
    const [{ fresh }] = await sql`select count(*)::int as fresh from curriculum_lessons where course_id like 'fr-%' and content::text like '%zzz%'`;
    expect(total - fresh).toBe(1);
    const courses = await coursesForLanguage(db, "fr");
    expect(courses[0].units.flatMap((u) => u.lessons).map((l) => l.id)).toEqual([first.id]);
  });
});
