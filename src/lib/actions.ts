"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { isLocale, type Locale } from "@/lib/i18n/config";
import * as repo from "@/lib/learner/repo";
import { z } from "zod";
import { onboardingInput, profileInput, trackInput } from "@/lib/validation";

const trackId = z.uuid();

export type ActionResult = { ok: true } | { ok: false; error: string };

async function uid(): Promise<string | null> {
  const s = await getSession();
  return s?.user.id ?? null;
}

function trackIdOf(id: unknown): string {
  const r = trackId.safeParse(id);
  if (!r.success) throw new repo.DomainError("not_found");
  return r.data;
}

function fail(e: unknown): ActionResult {
  if (e instanceof repo.DomainError) return { ok: false, error: e.code };
  console.error(e);
  return { ok: false, error: "generic" };
}

export async function completeOnboardingAction(lang: string, raw: unknown): Promise<ActionResult> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "unauthorized" };
  const parsed = onboardingInput.safeParse(raw);
  if (!parsed.success) {
    const same = parsed.error.issues.some((i) => i.message === "same_language");
    return { ok: false, error: same ? "same_language" : "invalid" };
  }
  const locale: Locale = isLocale(lang) ? lang : "ar";
  try {
    await repo.completeOnboarding(db, userId, parsed.data, locale);
  } catch (e) {
    return fail(e);
  }
  redirect(`/${locale}/dashboard`);
}

export async function updateProfileAction(raw: unknown): Promise<ActionResult> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "unauthorized" };
  const parsed = profileInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  try {
    await repo.updateProfile(db, userId, parsed.data);
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/[lang]", "layout");
  return { ok: true };
}

export async function addTrackAction(raw: unknown): Promise<ActionResult> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "unauthorized" };
  const parsed = trackInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  try {
    await repo.addTrack(db, userId, parsed.data);
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/[lang]", "layout");
  return { ok: true };
}

export async function updateTrackAction(id: string, raw: unknown): Promise<ActionResult> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "unauthorized" };
  const parsed = trackInput.omit({ targetLanguage: true }).safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  try {
    await repo.updateTrack(db, userId, trackIdOf(id), parsed.data);
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/[lang]", "layout");
  return { ok: true };
}

export async function setActiveTrackAction(id: string): Promise<ActionResult> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "unauthorized" };
  try {
    await repo.setActiveTrack(db, userId, trackIdOf(id));
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/[lang]", "layout");
  return { ok: true };
}

export async function deleteTrackAction(id: string): Promise<ActionResult> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "unauthorized" };
  try {
    await repo.deleteTrack(db, userId, trackIdOf(id));
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/[lang]", "layout");
  return { ok: true };
}

/* ------------------------- Phase 2: placement & lessons ------------------------- */

import * as study from "@/lib/learner/study";
import type { GradeResult } from "@/content";

const answerSchema = z.union([z.number().int().min(0).max(20), z.string().max(300), z.array(z.string().max(200)).max(12)]);

export async function startPlacementAction(lang: string): Promise<ActionResult> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "unauthorized" };
  const locale: Locale = isLocale(lang) ? lang : "ar";
  let testId: string;
  try {
    testId = (await study.startPlacement(db, userId)).id;
  } catch (e) {
    return fail(e);
  }
  redirect(`/${locale}/placement/${testId}`);
}

export async function answerPlacementAction(testId: string, itemId: string, answer: number): Promise<ActionResult & { done?: boolean }> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "unauthorized" };
  const id = z.uuid().safeParse(testId);
  const ans = z.number().int().min(0).max(10).safeParse(answer);
  if (!id.success || !ans.success || typeof itemId !== "string") return { ok: false, error: "invalid" };
  try {
    const r = await study.answerPlacement(db, userId, id.data, itemId, ans.data);
    if (r.done) revalidatePath("/[lang]", "layout");
    return { ok: true, done: r.done };
  } catch (e) {
    return fail(e);
  }
}

export async function checkExerciseAction(lessonId: string, exerciseId: string, answer: unknown): Promise<{ ok: true; result: GradeResult } | { ok: false; error: string }> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "unauthorized" };
  const a = answerSchema.safeParse(answer);
  if (!a.success || typeof lessonId !== "string" || typeof exerciseId !== "string") return { ok: false, error: "invalid" };
  try {
    return { ok: true, result: await study.checkExercise(db, userId, lessonId, exerciseId, a.data) };
  } catch (e) {
    return fail(e) as { ok: false; error: string };
  }
}

export async function submitQuizAction(lessonId: string, answers: unknown, durationSeconds: number) {
  const userId = await uid();
  if (!userId) return { ok: false as const, error: "unauthorized" };
  const parsed = z.record(z.string().max(20), answerSchema).safeParse(answers);
  if (!parsed.success || typeof lessonId !== "string") return { ok: false as const, error: "invalid" };
  try {
    const result = await study.submitQuiz(db, userId, lessonId, parsed.data, Number(durationSeconds));
    revalidatePath("/[lang]", "layout");
    return { ok: true as const, result };
  } catch (e) {
    return fail(e) as { ok: false; error: string };
  }
}
