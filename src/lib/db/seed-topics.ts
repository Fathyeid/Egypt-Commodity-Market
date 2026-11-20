/**
 * Seeds hand-written grammar topics (src/content/topics) and attaches them to
 * every unit: unit i of a level gets that level's topic i (round-robin).
 * Never overwrites a topic or a lesson's topic once set (the admin panel owns them).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { contentImports, curriculumCourses, curriculumLessons, curriculumTopics, curriculumUnits } from "./schema";
import { TOPIC_SEEDS, type TopicSeed } from "../../content/topics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export async function seedTopics(db: Db, topics: TopicSeed[] = TOPIC_SEEDS) {
  if (!topics.length) return { topics: 0, lessons: 0 };
  await db
    .insert(curriculumTopics)
    .values(topics.map((t) => ({ ...t, kind: "grammar", status: "published", videoStatus: "none" })))
    .onConflictDoNothing();
  // Units were re-planned (new themes first, even splits): re-attach automatic topics once.
  const [done] = await db.select().from(contentImports).where(eq(contentImports.source, "topics:v2"));
  if (!done) {
    await db.update(curriculumLessons).set({ topicId: null }).where(eq(curriculumLessons.source, "factory"));
    await db.insert(contentImports).values({ source: "topics:v2", hash: "v2", lessons: 0 }).onConflictDoNothing();
  }
  let lessons = 0;
  const groups = new Map<string, TopicSeed[]>();
  for (const t of topics) groups.set(`${t.language}:${t.level}`, [...(groups.get(`${t.language}:${t.level}`) ?? []), t]);
  for (const [key, list] of groups) {
    const [language, level] = key.split(":");
    const units = await db
      .select({ id: curriculumUnits.id })
      .from(curriculumUnits)
      .innerJoin(curriculumCourses, eq(curriculumCourses.id, curriculumUnits.courseId))
      .where(and(eq(curriculumCourses.language, language), eq(curriculumCourses.level, level)))
      .orderBy(asc(curriculumUnits.position));
    // Hand-written units come first in a course, so they get the level's first topics
    // (e.g. English A1 unit 1 → the verb "to be").
    for (const [i, unit] of units.entries()) {
      const res = await db
        .update(curriculumLessons)
        .set({ topicId: list[i % list.length].id })
        .where(and(eq(curriculumLessons.unitId, unit.id), isNull(curriculumLessons.topicId)))
        .returning({ id: curriculumLessons.id });
      lessons += res.length;
    }
  }
  return { topics: topics.length, lessons };
}

export type FoundVideo = { videoId: string | null; title?: string; channel?: string };

/**
 * Applies videos found by the YouTube workflow (data/videos.json) to topics nobody
 * has touched yet (video_status "none"). An admin can still reject or replace them.
 */
export async function applyTopicVideos(db: Db, file = join(process.cwd(), "data/videos.json")) {
  if (!existsSync(file)) return 0;
  const found = JSON.parse(readFileSync(file, "utf8")) as Record<string, FoundVideo>;
  let n = 0;
  for (const [id, v] of Object.entries(found)) {
    if (!v.videoId || !/^[\w-]{11}$/.test(v.videoId)) continue;
    const title = [v.title, v.channel].filter(Boolean).join(" — ").slice(0, 200) || null;
    const res = await db
      .update(curriculumTopics)
      .set({ videoId: v.videoId, videoTitle: title, videoStatus: "approved", updatedAt: new Date() })
      .where(and(eq(curriculumTopics.id, id), eq(curriculumTopics.videoStatus, "none")))
      .returning({ id: curriculumTopics.id });
    n += res.length;
  }
  return n;
}

type ChannelVideos = {
  topics?: Record<string, FoundVideo>;
  themes?: Record<string, Record<string, FoundVideo[]>>;
};
const LEVEL_INDEX: Record<string, number> = { a1: 0, a2: 1, b1: 2, b2: 3, c1: 4, c2: 5 };
const FACTORY_ID = /^([a-z]{2})-(a1|a2|b1|b2|c1|c2)-f-([a-z]+)-(\d+)$/;

/** The video a factory lesson gets from its unit theme's list (spread so neighbours differ). */
export function pickLessonVideo(lessonId: string, themes: ChannelVideos["themes"]): FoundVideo | null {
  const m = FACTORY_ID.exec(lessonId);
  if (!m || !themes) return null;
  const [, lang, lvl, theme, n] = m;
  const list = (themes[lang]?.[theme] ?? []).filter((v) => v.videoId && /^[\w-]{11}$/.test(v.videoId));
  if (!list.length) return null;
  return list[(LEVEL_INDEX[lvl] * 7 + Number(n) - 1) % list.length];
}

/**
 * Applies data/channel-videos.json: topic videos for untouched topics, and a video for
 * every factory lesson whose unit theme has matches (lessons that already have one keep it).
 */
export async function applyChannelVideos(db: Db, file = join(process.cwd(), "data/channel-videos.json")) {
  if (!existsSync(file)) return { topics: 0, lessons: 0 };
  const data = JSON.parse(readFileSync(file, "utf8")) as ChannelVideos;
  let topics = 0;
  if (data.topics) {
    for (const [id, v] of Object.entries(data.topics)) {
      if (!v.videoId || !/^[\w-]{11}$/.test(v.videoId)) continue;
      const res = await db
        .update(curriculumTopics)
        .set({ videoId: v.videoId, videoTitle: [v.title, v.channel].filter(Boolean).join(" — ").slice(0, 200) || null, videoStatus: "approved", updatedAt: new Date() })
        .where(and(eq(curriculumTopics.id, id), eq(curriculumTopics.videoStatus, "none")))
        .returning({ id: curriculumTopics.id });
      topics += res.length;
    }
  }
  const rows = await db
    .select({ id: curriculumLessons.id })
    .from(curriculumLessons)
    .where(and(eq(curriculumLessons.source, "factory"), isNull(curriculumLessons.videoId)));
  const updates = rows
    .map((r) => ({ id: r.id, v: pickLessonVideo(r.id, data.themes) }))
    .filter((u): u is { id: string; v: FoundVideo } => !!u.v);
  for (let i = 0; i < updates.length; i += 500) {
    const chunk = updates.slice(i, i + 500);
    const values = sql.join(
      chunk.map((u) => sql`(${u.id}, ${u.v.videoId}, ${[u.v.title, u.v.channel].filter(Boolean).join(" — ").slice(0, 200)})`),
      sql`, `,
    );
    await db.execute(sql`update curriculum_lessons as l set video_id = v.video_id, video_title = v.video_title
      from (values ${values}) as v(id, video_id, video_title) where l.id = v.id and l.video_id is null`);
  }
  return { topics, lessons: updates.length };
}
