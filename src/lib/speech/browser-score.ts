import type { PronResult, WordResult } from "./azure";

/**
 * Free pronunciation check: compares what the browser's speech recognizer heard
 * with the sentence the learner meant to say. It measures how intelligible each
 * word was, not phoneme-level accuracy, so fluency and prosody are not measured.
 */
const NO_SPACE = new Set(["zh", "ja"]);

const clean = (s: string) => s.normalize("NFC").toLowerCase().replace(/[\p{P}\p{S}]/gu, " ").replace(/\s+/g, " ").trim();
// Arabic: ignore diacritics and unify alef/ya/ta-marbuta variants the recognizer may write differently.
const fold = (s: string, language: string) =>
  language === "ar" ? s.replace(/[ً-ٰٟ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه") : s;

/** Display units (the learner's own spelling) and their comparison keys. */
export function units(text: string, language: string): { show: string[]; key: string[] } {
  if (NO_SPACE.has(language)) {
    const show = [...text.normalize("NFC")].filter((c) => /[\p{L}\p{N}]/u.test(c));
    return { show, key: show.map((c) => c.toLowerCase()) };
  }
  const show = text.normalize("NFC").split(/\s+/).map((w) => w.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "")).filter(Boolean);
  return { show, key: show.map((w) => fold(clean(w), language)) };
}

function lev(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}
const similarity = (a: string, b: string) => (a === b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length, 1));

/** Aligns reference words to heard words (edit-distance DP), scoring near-misses partially. */
function align(ref: string[], hyp: string[]): (number | null)[] {
  const n = ref.length;
  const m = hyp.length;
  const cost = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 0; i <= n; i++) cost[i][0] = i;
  for (let j = 0; j <= m; j++) cost[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) cost[i][j] = Math.min(cost[i - 1][j] + 1, cost[i][j - 1] + 1, cost[i - 1][j - 1] + (1 - similarity(ref[i - 1], hyp[j - 1])) * 1.2);
  const out: (number | null)[] = new Array(n).fill(null);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const sim = similarity(ref[i - 1], hyp[j - 1]);
    if (Math.abs(cost[i][j] - (cost[i - 1][j - 1] + (1 - sim) * 1.2)) < 1e-9) {
      out[i - 1] = sim;
      i--;
      j--;
    } else if (Math.abs(cost[i][j] - (cost[i - 1][j] + 1)) < 1e-9) i--;
    else j--;
  }
  return out;
}

export function scoreTranscript(reference: string, heard: string[], language: string): PronResult {
  const ref = units(reference, language);
  let best: { sims: (number | null)[]; text: string; total: number } | null = null;
  for (const h of heard.length ? heard : [""]) {
    const sims = align(ref.key, units(h, language).key);
    const total = sims.reduce<number>((s, x) => s + (x ?? 0), 0);
    if (!best || total > best.total) best = { sims, text: h, total };
  }
  const sims = best!.sims;
  const words: WordResult[] = ref.show.map((w, k) => {
    const s = sims[k];
    const accuracy = s === null ? 0 : Math.round(s * 100);
    return { word: w, accuracy, errorType: s === null ? "Omission" : accuracy >= 80 ? "None" : "Mispronunciation", phonemes: [] };
  });
  const n = Math.max(words.length, 1);
  const accuracy = Math.round(words.reduce((s, w) => s + (w.accuracy ?? 0), 0) / n);
  const completeness = Math.round((sims.filter((s) => s !== null && s >= 0.5).length / n) * 100);
  return {
    recognized: best!.text,
    scores: { accuracy, fluency: null, completeness, pronunciation: Math.round(accuracy * 0.7 + completeness * 0.3), prosody: null },
    words,
  };
}
