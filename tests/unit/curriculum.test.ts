import { afterAll, describe, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { coursesForLanguage, getLesson, nextLessonId, outlineLessonIds } from "@/lib/curriculum";

const sql = postgres(process.env.DATABASE_URL!, { max: 2, onnotice: () => {} });
const db = drizzle(sql, { schema });
afterAll(async () => {
  await sql`delete from curriculum_lessons where id like 'test-%'`;
  await sql`delete from curriculum_topics where id like 'test-%'`;
  await sql.end();
});

describe("curriculum (database)", () => {
  it("serves the seeded hand-written courses in order", async () => {
    const [course] = await coursesForLanguage(db, "en");
    expect(course.id).toBe("en-a1");
    expect(outlineLessonIds(course)).toHaveLength(6);
    expect(await nextLessonId(db, "en-a1", 0)).toBe("en-a1-u1-l2");
  });

  it("hides drafts from learners, and shows a topic video only once approved", async () => {
    await db.insert(schema.curriculumTopics).values({ id: "test-topic", language: "en", level: "A1", kind: "grammar", title: { ar: "اختبار", en: "Test" }, explanation: { ar: "شرح", en: "Explanation" }, videoId: "abc123", videoStatus: "suggested", status: "published" });
    const base = (await getLesson(db, "en-a1-u1-l1"))!;
    const { id: _id, title, goal, ...content } = base.lesson;
    void _id;
    await db.insert(schema.curriculumLessons).values({ id: "test-draft", courseId: "en-a1", unitId: "en-a1-u1", position: 999, title, goal, content, topicId: "test-topic", source: "ai", status: "draft" });

    expect(await getLesson(db, "test-draft")).toBeNull();
    expect(outlineLessonIds((await coursesForLanguage(db, "en"))[0])).not.toContain("test-draft");
    const preview = (await getLesson(db, "test-draft", { includeDrafts: true }))!;
    expect(preview.topic).toMatchObject({ explanation: { en: "Explanation" }, videoId: null });

    await db.update(schema.curriculumTopics).set({ videoStatus: "approved" }).where(eq(schema.curriculumTopics.id, "test-topic"));
    await db.update(schema.curriculumLessons).set({ status: "published" }).where(eq(schema.curriculumLessons.id, "test-draft"));
    expect((await getLesson(db, "test-draft"))!.topic?.videoId).toBe("abc123");
  });
});
