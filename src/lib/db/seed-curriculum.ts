/** Upserts the hand-written courses (src/content/courses) into the curriculum tables as published. */
import { sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { curriculumCourses, curriculumLessons, curriculumUnits } from "./schema";
import { enA1 } from "../../content/courses/en-a1";
import { deA1 } from "../../content/courses/de-a1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export const HANDWRITTEN_COURSES = [enA1, deA1];

export async function seedHandwrittenCurriculum(db: Db) {
  for (const [ci, course] of HANDWRITTEN_COURSES.entries()) {
    await db
      .insert(curriculumCourses)
      .values({ id: course.id, language: course.language, level: course.level, title: course.title, sortOrder: ci })
      .onConflictDoUpdate({ target: curriculumCourses.id, set: { title: course.title } });
    let position = 0;
    for (const [ui, unit] of course.units.entries()) {
      await db
        .insert(curriculumUnits)
        .values({ id: unit.id, courseId: course.id, position: ui, title: unit.title })
        .onConflictDoUpdate({ target: curriculumUnits.id, set: { title: unit.title, position: ui } });
      for (const lesson of unit.lessons) {
        const { id, title, goal, ...content } = lesson;
        await db
          .insert(curriculumLessons)
          .values({ id, courseId: course.id, unitId: unit.id, position: position++, title, goal, content, source: "handwritten", status: "published" })
          .onConflictDoUpdate({
            target: curriculumLessons.id,
            set: { title, goal, content, position: sql`excluded.position`, unitId: unit.id, updatedAt: new Date() },
          });
      }
    }
  }
}
