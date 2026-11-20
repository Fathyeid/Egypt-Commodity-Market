import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { getActiveTrack } from "@/lib/learner/repo";
import { recordPronAttempt } from "@/lib/learner/skills";
import { checkLimits } from "@/lib/ai/limits";
import { assessPronunciation } from "@/lib/speech/provider";
import { wavSeconds } from "@/lib/speech/wav";

const MAX_BYTES = 16000 * 2 * 20 + 44; // 20 s of 16 kHz mono 16-bit audio

/** POST multipart/form-data: audio (WAV, 16 kHz mono) + text (reference sentence). */
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");
  const text = String(form?.get("text") ?? "").trim().slice(0, 300);
  if (!(audio instanceof Blob) || !text || audio.size < 1000 || audio.size > MAX_BYTES) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  const track = await getActiveTrack(db, session.user.id);
  if (!track) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  const limit = await checkLimits(db, session.user.id);
  if (limit !== "ok") return Response.json({ ok: false, error: limit }, { status: 429 });

  const wav = await audio.arrayBuffer();
  const r = await assessPronunciation(wav, text, track.targetLanguage);
  if (!r.ok) return Response.json({ ok: false, error: r.error }, { status: r.error === "not_configured" ? 503 : 422 });
  const row = await recordPronAttempt(db, session.user.id, { trackId: track.id, referenceText: text, locale: r.locale, provider: r.provider, result: r.result, seconds: wavSeconds(wav.byteLength) });
  return Response.json({ ok: true, id: row.id, provider: r.provider, locale: r.locale, ...r.result });
}
