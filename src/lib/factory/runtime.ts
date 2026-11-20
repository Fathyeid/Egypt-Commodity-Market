import "server-only";
/**
 * Builds factory lessons on demand from the shipped corpus, so the database only stores
 * lesson outlines (≈50,000 lessons would not fit the free database tier as full JSON).
 * Plans are cached per language for the life of the server instance.
 */
import { corpusFile, readCorpus } from "./corpus";
import { buildPlannedLesson, planCourses, type FactoryLesson, type PlannedLesson, type PlannedLevel } from "./generate";

type Index = Map<string, { level: PlannedLevel; lesson: PlannedLesson }>;
const cache: Map<string, Index> = ((globalThis as { __lisanFactory?: Map<string, Index> }).__lisanFactory ??= new Map());

function indexFor(language: string): Index | null {
  const hit = cache.get(language);
  if (hit) return hit;
  const file = corpusFile(language);
  if (!file) return null;
  const index: Index = new Map();
  for (const level of planCourses(language, readCorpus(file))) {
    for (const unit of level.units) for (const lesson of unit.lessons) index.set(lesson.id, { level, lesson });
  }
  cache.set(language, index);
  return index;
}

export function factoryLesson(lessonId: string): FactoryLesson | null {
  const language = lessonId.split("-")[0];
  const hit = indexFor(language)?.get(lessonId);
  return hit ? buildPlannedLesson(language, hit.level, hit.lesson) : null;
}
