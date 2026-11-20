import "server-only";
import { azureAssess, SPEECH_LOCALES, type PronResult } from "./azure";

export type SpeechStatus = "live" | "test" | "not_configured";

export function speechStatus(): SpeechStatus {
  if (process.env.SPEECH_PROVIDER === "fake") return "test";
  return process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION ? "live" : "not_configured";
}

export type AssessError = "not_configured" | "no_speech" | "unsupported_language" | "busy" | "failed";

/** Scripted result for automated tests only (labelled "test" in the UI). */
function fakeResult(referenceText: string): PronResult {
  const words = referenceText.split(/\s+/).filter(Boolean).map((w, i) => ({
    word: w.replace(/[.,!?]/g, ""),
    accuracy: i === 1 ? 48 : 92,
    errorType: i === 1 ? "Mispronunciation" : "None",
    phonemes: [],
  }));
  return { recognized: `[test] ${referenceText}`, scores: { accuracy: 84, fluency: 90, completeness: 100, pronunciation: 86, prosody: null }, words };
}

export async function assessPronunciation(wav: ArrayBuffer, referenceText: string, language: string): Promise<{ ok: true; result: PronResult; locale: string; provider: "azure" | "test" } | { ok: false; error: AssessError }> {
  const locale = SPEECH_LOCALES[language];
  if (!locale) return { ok: false, error: "unsupported_language" };
  const status = speechStatus();
  if (status === "not_configured") return { ok: false, error: "not_configured" };
  if (status === "test") return { ok: true, result: fakeResult(referenceText), locale, provider: "test" };
  try {
    const r = await azureAssess(wav, referenceText, locale, process.env.AZURE_SPEECH_KEY!, process.env.AZURE_SPEECH_REGION!);
    if (!r.ok) return { ok: false, error: r.error === "auth" ? "not_configured" : r.error };
    return { ok: true, result: r.result, locale, provider: "azure" };
  } catch (e) {
    console.error("Speech error:", e);
    return { ok: false, error: "failed" };
  }
}
