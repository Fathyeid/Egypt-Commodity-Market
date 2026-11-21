import "server-only";
/**
 * Shared, user-independent reads, cached across requests and users.
 * Admin mutations revalidate these via updateTag (src/lib/admin/actions.ts).
 * Never cache anything user-scoped here.
 */
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { listLanguages } from "@/lib/learner/repo";
import { coursesForLanguage } from "@/lib/curriculum";

export async function cachedLanguages() {
  "use cache";
  cacheLife("hours");
  cacheTag("languages");
  return listLanguages(db);
}

export async function cachedCoursesForLanguage(language: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("curriculum");
  return coursesForLanguage(db, language);
}
