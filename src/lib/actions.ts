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
