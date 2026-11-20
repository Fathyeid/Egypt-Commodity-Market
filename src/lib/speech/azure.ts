/**
 * Pronunciation assessment via Azure AI Speech (REST, short audio).
 * Request/response shapes follow Microsoft's published REST interface; the
 * parser accepts both the flattened and the nested "PronunciationAssessment"
 * forms. Not exercised against live Azure until the owner adds a key.
 */

export type WordResult = { word: string; accuracy: number | null; errorType: string; phonemes: { phoneme: string; accuracy: number | null }[] };
export type PronResult = {
  recognized: string;
  scores: { accuracy: number | null; fluency: number | null; completeness: number | null; pronunciation: number | null; prosody: number | null };
  words: WordResult[];
};

/** Target-language → speech locale. */
export const SPEECH_LOCALES: Record<string, string> = {
  en: "en-US", de: "de-DE", fr: "fr-FR", es: "es-ES", it: "it-IT", pt: "pt-BR", ja: "ja-JP", ko: "ko-KR", zh: "zh-CN", ru: "ru-RU", tr: "tr-TR", ar: "ar-EG",
};
/** Prosody (stress/intonation/rhythm) is only requested where it's documented: US English. */
export const PROSODY_LOCALES = new Set(["en-US"]);

const num = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? Math.round(x) : null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

export function parseAzureResult(json: Json): PronResult | null {
  if (!json || json.RecognitionStatus !== "Success" || !Array.isArray(json.NBest) || !json.NBest.length) return null;
  const best = json.NBest[0];
  const pa = best.PronunciationAssessment ?? best;
  const words: WordResult[] = (best.Words ?? []).map((w: Json) => {
    const wp = w.PronunciationAssessment ?? w;
    return {
      word: String(w.Word ?? ""),
      accuracy: num(wp.AccuracyScore),
      errorType: String(wp.ErrorType ?? "None"),
      phonemes: (w.Phonemes ?? []).map((p: Json) => ({ phoneme: String(p.Phoneme ?? ""), accuracy: num((p.PronunciationAssessment ?? p).AccuracyScore) })),
    };
  });
  return {
    recognized: String(best.Display ?? json.DisplayText ?? ""),
    scores: {
      accuracy: num(pa.AccuracyScore),
      fluency: num(pa.FluencyScore),
      completeness: num(pa.CompletenessScore),
      pronunciation: num(pa.PronScore),
      prosody: num(pa.ProsodyScore),
    },
    words,
  };
}

export async function azureAssess(wav: ArrayBuffer, referenceText: string, locale: string, key: string, region: string): Promise<{ ok: true; result: PronResult } | { ok: false; error: "no_speech" | "unsupported_language" | "busy" | "failed" | "auth" }> {
  const params = {
    ReferenceText: referenceText,
    GradingSystem: "HundredMark",
    Granularity: "Phoneme",
    Dimension: "Comprehensive",
    EnableMiscue: true,
    ...(PROSODY_LOCALES.has(locale) ? { EnableProsodyAssessment: true } : {}),
  };
  const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${encodeURIComponent(locale)}&format=detailed`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
      Accept: "application/json",
      "Pronunciation-Assessment": Buffer.from(JSON.stringify(params), "utf8").toString("base64"),
    },
    body: wav,
  });
  if (res.status === 401 || res.status === 403) return { ok: false, error: "auth" };
  if (res.status === 429 || res.status >= 500) return { ok: false, error: "busy" };
  if (res.status === 400) return { ok: false, error: "unsupported_language" };
  if (!res.ok) return { ok: false, error: "failed" };
  const json = await res.json();
  const parsed = parseAzureResult(json);
  if (!parsed) return { ok: false, error: json?.RecognitionStatus === "NoMatch" || json?.RecognitionStatus === "InitialSilenceTimeout" ? "no_speech" : "failed" };
  return { ok: true, result: parsed };
}
