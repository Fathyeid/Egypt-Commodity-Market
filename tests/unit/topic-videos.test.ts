import { afterAll, describe, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as schema from "@/lib/db/schema";
import { applyTopicVideos } from "@/lib/db/seed-topics";

const sql = postgres(process.env.DATABASE_URL!, { max: 2, onnotice: () => {} });
const db = drizzle(sql, { schema });
afterAll(async () => {
  await sql`delete from curriculum_topics where id like 'tv-test-%'`;
  await sql.end();
});

describe("topic videos from the YouTube workflow", () => {
  it("fills untouched topics only, and ignores invalid ids", async () => {
    const t = { language: "en", level: "A1", kind: "grammar", title: { ar: "س", en: "T" }, status: "published" };
    await db.insert(schema.curriculumTopics).values([
      { ...t, id: "tv-test-new" },
      { ...t, id: "tv-test-rejected", videoStatus: "rejected" },
      { ...t, id: "tv-test-bad" },
    ]);
    const dir = mkdtempSync(join(tmpdir(), "videos-"));
    const file = join(dir, "videos.json");
    writeFileSync(file, JSON.stringify({
      "tv-test-new": { videoId: "dQw4w9WgXcQ", title: "Lesson", channel: "Channel" },
      "tv-test-rejected": { videoId: "dQw4w9WgXcQ" },
      "tv-test-bad": { videoId: "not valid!" },
      "tv-test-missing": { videoId: null },
    }));
    expect(await applyTopicVideos(db, file)).toBe(1);
    const rows = await sql`select id, video_id, video_status, video_title from curriculum_topics where id like 'tv-test-%' order by id`;
    expect(rows.map((r) => [r.id, r.video_status])).toEqual([["tv-test-bad", "none"], ["tv-test-new", "approved"], ["tv-test-rejected", "rejected"]]);
    expect(rows[1].video_title).toBe("Lesson — Channel");
    expect(await applyTopicVideos(db, file)).toBe(0); // idempotent
  });
});
