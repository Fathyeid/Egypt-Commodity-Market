"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { LESSON_STATUSES, VIDEO_STATUSES, isAdminEmail, linkTopicToUnit, parseYouTubeId, saveTopic, setCourseStatus, setLessonStatus } from "./index";

async function assertAdmin() {
  const s = await getSession();
  if (!s || !isAdminEmail(s.user.email)) throw new Error("forbidden");
}

const status = z.enum(LESSON_STATUSES);
const id = z.string().min(1).max(120).regex(/^[\w-]+$/);
const langOf = (v: FormDataEntryValue | null) => (typeof v === "string" && isLocale(v) ? v : "ar");

export async function setLessonStatusAction(form: FormData) {
  await assertAdmin();
  const ids = z.array(id).min(1).max(200).parse(form.getAll("id"));
  await setLessonStatus(db, ids, status.parse(form.get("status")));
  revalidatePath("/[lang]/admin", "layout");
  revalidatePath("/[lang]/learn", "layout");
}

export async function setCourseStatusAction(form: FormData) {
  await assertAdmin();
  await setCourseStatus(db, id.parse(form.get("courseId")), status.parse(form.get("from")), status.parse(form.get("to")));
  revalidatePath("/[lang]/admin", "layout");
  revalidatePath("/[lang]/learn", "layout");
}

const topicForm = z.object({
  id: id,
  language: z.string().min(2).max(8),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  kind: z.enum(["grammar", "vocabulary", "skill"]),
  titleAr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  explanationAr: z.string().trim().max(8000),
  explanationEn: z.string().trim().max(8000),
  videoUrl: z.string().trim().max(300),
  videoTitle: z.string().trim().max(200),
  videoStatus: z.enum(VIDEO_STATUSES),
  status: z.enum(["draft", "published"]),
});

export type TopicFormState = { ok: boolean; error?: "invalid" | "invalidVideo" } | null;

export async function saveTopicAction(_prev: TopicFormState, form: FormData): Promise<TopicFormState> {
  await assertAdmin();
  const parsed = topicForm.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: "invalid" };
  const f = parsed.data;
  const videoId = f.videoUrl ? parseYouTubeId(f.videoUrl) : null;
  if (f.videoUrl && !videoId) return { ok: false, error: "invalidVideo" };
  const explanation = f.explanationAr || f.explanationEn ? { ar: f.explanationAr || f.explanationEn, en: f.explanationEn || f.explanationAr } : null;
  await saveTopic(db, {
    id: f.id,
    language: f.language,
    level: f.level,
    kind: f.kind,
    title: { ar: f.titleAr, en: f.titleEn },
    explanation,
    videoId,
    videoTitle: f.videoTitle || null,
    videoStatus: videoId ? f.videoStatus : "none",
    status: f.status,
  });
  revalidatePath("/[lang]/admin", "layout");
  revalidatePath("/[lang]/learn", "layout");
  if (form.get("isNew") === "1") redirect(`/${langOf(form.get("lang"))}/admin/topics/${f.id}`);
  return { ok: true };
}

export async function linkTopicAction(form: FormData) {
  await assertAdmin();
  await linkTopicToUnit(db, id.parse(form.get("topicId")), id.parse(form.get("unitId")));
  revalidatePath("/[lang]/admin", "layout");
  revalidatePath("/[lang]/learn", "layout");
}
