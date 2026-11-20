import { afterAll, describe, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import * as schema from "@/lib/db/schema";
import { factoryStatus, seedFactoryCurriculum } from "@/lib/db/seed-factory";
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
  it("publishes by default; FACTORY_STATUS=draft keeps lessons for review", () => {
    expect(factoryStatus({})).toBe("published");
    expect(factoryStatus({ FACTORY_STATUS: "draft" })).toBe("draft");
  });

  it("imports drafts, skips unchanged corpora, refreshes content and respects review status", async () => {
    await cleanup();
    const dir = mkdtempSync(join(tmpdir(), "corpus-"));
    writeCorpus(dir, 600);
    const logs: string[] = [];
    await seedFactoryCurriculum(db, dir, (m) => logs.push(m), "draft");
    const [{ n }] = await sql`select count(*)::int as n from curriculum_lessons where course_id like 'fr-%' and status = 'draft' and source = 'factory'`;
    expect(n).toBeGreaterThan(30);
    expect(await coursesForLanguage(db, "fr")).toEqual([]); // drafts are invisible to learners

    await seedFactoryCurriculum(db, dir, (m) => logs.push(m), "draft");
    expect(logs.at(-1)).toContain("unchanged");

    const [first, second] = await sql`select id, content from curriculum_lessons where course_id = 'fr-a1' order by position limit 2`;
    await sql`update curriculum_lessons set status = 'published' where id = ${first.id}`;
    await sql`update curriculum_lessons set status = 'rejected' where id = ${second.id}`;
    writeCorpus(dir, 600, " !");
    await seedFactoryCurriculum(db, dir, (m) => logs.push(m), "draft");
    const [pub] = await sql`select content, status from curriculum_lessons where id = ${first.id}`;
    expect(pub.status).toBe("published"); // review status is kept…
    expect(JSON.stringify(pub.content)).toContain(" !"); // …while generated content is refreshed
    const [rej] = await sql`select content, status from curriculum_lessons where id = ${second.id}`;
    expect(rej.status).toBe("rejected");
    expect(rej.content).toEqual(second.content); // rejected lessons are never touched

    // A much smaller corpus drops lessons it no longer produces, except rejected ones.
    writeCorpus(dir, 120, " zzz");
    await seedFactoryCurriculum(db, dir, (m) => logs.push(m), "draft");
    expect(logs.some((m) => m.includes("outdated"))).toBe(true);
    const rows = await sql`select id, status, content::text like '%zzz%' as fresh from curriculum_lessons where course_id like 'fr-%'`;
    expect(rows.filter((r) => !r.fresh).map((r) => r.id)).toEqual([second.id]);
    const visible = (await coursesForLanguage(db, "fr")).flatMap((c) => c.units.flatMap((u) => u.lessons.map((l) => l.id)));
    expect(visible).toEqual(rows.filter((r) => r.status === "published").map((r) => r.id));
  });
});
