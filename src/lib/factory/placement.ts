/**
 * Placement questions generated from the graded Tatoeba corpus for languages
 * without a hand-written bank. Every question uses a real sentence from the level's
 * difficulty band: two each of vocabulary, grammar, reading and listening per level (A1–C1),
 * the same shape as the hand-written banks, so the adaptive engine treats them alike.
 */
import type { PlacementItem } from "@/content/types";
import { bandRows, type CorpusRow } from "./generate";

const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
const NO_SPACE = new Set(["zh", "ja"]);
const PER_SKILL = 2;

/** Grammar words per language: articles, prepositions, particles, auxiliaries. */
const GRAMMAR_WORDS: Record<string, string[]> = {
  fr: ["le", "la", "les", "un", "une", "des", "de", "du", "à", "au", "aux", "en", "dans", "sur", "pour", "par", "avec", "sans", "que", "qui", "ce", "cette", "ces", "mon", "ma", "mes", "son", "sa", "ses"],
  es: ["el", "la", "los", "las", "un", "una", "de", "del", "a", "al", "en", "con", "por", "para", "que", "se", "su", "sus", "mi", "mis", "este", "esta", "muy"],
  it: ["il", "lo", "la", "i", "gli", "le", "un", "una", "di", "del", "della", "a", "al", "in", "con", "per", "che", "si", "mi", "ti", "ma"],
  pt: ["o", "a", "os", "as", "um", "uma", "de", "do", "da", "em", "no", "na", "com", "por", "para", "que", "se", "meu", "minha", "seu", "sua"],
  tr: ["bir", "ve", "bu", "şu", "çok", "ile", "için", "ama", "gibi", "daha", "en", "mi", "mı", "mu", "mü", "değil"],
  ru: ["в", "на", "с", "по", "к", "у", "о", "из", "за", "от", "до", "и", "но", "что", "как", "это"],
  ar: ["في", "من", "إلى", "على", "عن", "مع", "هذا", "هذه", "ذلك", "تلك", "الذي", "التي", "أن", "إن", "لا", "لم", "لن", "ما", "هل", "قد", "ثم", "أو", "كان"],
  zh: ["的", "了", "是", "在", "不", "吗", "呢", "把", "被", "着", "过", "和", "也", "都", "很", "就", "要", "会"],
  ja: ["は", "が", "を", "に", "で", "と", "も", "の", "へ", "か"],
};
/** Korean particles attach to the word, so the blank replaces the ending. */
const KO_PARTICLES = ["에서", "는", "은", "가", "이", "를", "을", "에", "도", "의", "와", "과", "로"];

/** Names (Tom, Ziri, Sami…) in any script: tokens that almost always come with the same capitalised English word. */
function nameTokens(rows: CorpusRow[], language: string): Set<string> {
  const seen = new Map<string, number>();
  const withCap = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const caps = new Set((r.en.match(/[A-Za-z’']+/g) ?? []).slice(1).filter((w) => /^[A-Z]/.test(w) && w !== "I"));
    for (const tok of new Set(tokenize(r.t, language).map(key))) {
      seen.set(tok, (seen.get(tok) ?? 0) + 1);
      if (!caps.size) continue;
      const m = withCap.get(tok) ?? new Map<string, number>();
      for (const c of caps) m.set(c, (m.get(c) ?? 0) + 1);
      withCap.set(tok, m);
    }
  }
  const out = new Set<string>();
  for (const [tok, m] of withCap) {
    const n = seen.get(tok)!;
    if (n >= 4 && Math.max(...m.values()) / n >= 0.75) out.add(tok);
  }
  return out;
}

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
    return (h >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const tokenize = (text: string, language: string): string[] =>
  NO_SPACE.has(language) ? [...text].filter((c) => /\p{L}/u.test(c)) : (text.match(/[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*/gu) ?? []);
const key = (w: string) => w.toLowerCase();

/** Meaning in the learner's language: Arabic when every option has one, otherwise English. */
const meaningOf = (r: CorpusRow, arabic: boolean) => (arabic ? r.ar! : r.en);

/** Replaces the first whole-word occurrence of `word` with a blank. */
function blank(text: string, word: string, language: string): string | null {
  if (NO_SPACE.has(language)) {
    const i = text.indexOf(word);
    return i < 0 ? null : text.slice(0, i) + "＿＿" + text.slice(i + word.length);
  }
  const re = new RegExp(`(^|[^\\p{L}\\p{M}])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^\\p{L}\\p{M}])`, "u");
  if (!re.test(text)) return null;
  return text.replace(re, (_m, pre: string) => `${pre}___`);
}

export function buildPlacementBank(language: string, rows: CorpusRow[]): PlacementItem[] {
  const bands = bandRows(rows);
  const freq = new Map<string, number>();
  for (const r of rows) for (const w of tokenize(r.t, language)) freq.set(key(w), (freq.get(key(w)) ?? 0) + 1);
  const rank = new Map([...freq.entries()].sort((a, b) => b[1] - a[1]).map(([w], i) => [w, i + 1]));
  const names = nameTokens(rows, language);
  const functionWords = (GRAMMAR_WORDS[language] ?? [...rank.entries()].filter(([w, i]) => i <= 30 && !names.has(w)).map(([w]) => w)).filter((w) => rank.has(w));
  const fwSet = new Set(functionWords);
  const minLen = NO_SPACE.has(language) ? 1 : 3;

  const items: PlacementItem[] = [];
  const used = new Set<number>();

  for (const level of LEVELS) {
    const band = bands.get(level) ?? [];
    if (band.length < 40) continue;
    const rand = rng(`${language}:${level}`);
    const pool = shuffle(band, rand).filter((r) => !used.has(r.id));
    const take = (pred: (r: CorpusRow) => boolean) => {
      const r = pool.find((x) => !used.has(x.id) && pred(x));
      if (r) used.add(r.id);
      return r;
    };
    const content = (w: string) => w.length >= minLen && !fwSet.has(key(w)) && !names.has(key(w)) && !/^\p{Lu}/u.test(w);
    const bandWords = [...new Set(band.flatMap((r) => tokenize(r.t, language)))].filter(content);

    const options = (correct: string, distractors: string[]) => {
      const opts = shuffle([correct, ...distractors.slice(0, 3)], rand);
      return { options: opts, answer: opts.indexOf(correct) };
    };
    const id = (skill: string, k: number) => `${language}-auto-${skill}-${level.toLowerCase()}-${k}`;

    // Vocabulary: the sentence's least frequent word is missing; the meaning is shown as a hint.
    // Chinese and Japanese have no spaces to cut words at, so there the learner picks the sentence with the given meaning.
    for (let k = 1; k <= PER_SKILL && NO_SPACE.has(language); k++) {
      const r = take((x) => [...x.t].length >= 4);
      if (!r) break;
      const distract = [...new Set(shuffle(band.filter((x) => x.id !== r.id && x.en !== r.en), rand).map((x) => x.t))].slice(0, 3);
      if (distract.length < 3) continue;
      items.push({ id: id("v", k), skill: "vocabulary", level, prompt: "اختر الجملة المناسبة · Choose the matching sentence", note: `المعنى · Meaning: ${r.ar ?? r.en}`, ...options(r.t, distract) });
    }
    for (let k = 1; k <= PER_SKILL && !NO_SPACE.has(language); k++) {
      let made = false;
      for (let tries = 0; tries < 60 && !made; tries++) {
        const r = take((x) => tokenize(x.t, language).length >= 3);
        if (!r) break;
        const toks = tokenize(r.t, language).filter(content);
        if (!toks.length) continue;
        const target = toks.reduce((a, b) => ((rank.get(key(b)) ?? 0) > (rank.get(key(a)) ?? 0) ? b : a));
        const cloze = blank(r.t, target, language);
        const tr = rank.get(key(target)) ?? 0;
        const inSentence = new Set(tokenize(r.t, language).map(key));
        const near = shuffle(bandWords.filter((w) => !inSentence.has(key(w)) && Math.abs((rank.get(key(w)) ?? 0) - tr) < Math.max(400, tr * 0.6)), rand);
        const distract = [...new Set(near.map(key))].slice(0, 3).map((kw) => near.find((w) => key(w) === kw)!);
        if (!cloze || distract.length < 3) continue;
        items.push({ id: id("v", k), skill: "vocabulary", level, prompt: cloze, note: `المعنى · Meaning: ${r.ar ?? r.en}`, ...options(target, distract) });
        made = true;
      }
    }

    // Grammar: a frequent function word (article, particle, preposition…) is missing.
    for (let k = 1; k <= PER_SKILL; k++) {
      let made = false;
      for (let tries = 0; tries < 80 && !made; tries++) {
        const r = take((x) => tokenize(x.t, language).length >= 3);
        if (!r) break;
        const toks = tokenize(r.t, language);
        if (language === "ko") {
          const word = toks.find((w) => !names.has(key(w)) && KO_PARTICLES.some((p) => w.endsWith(p) && w.length > p.length + 1));
          const particle = word && KO_PARTICLES.find((p) => word.endsWith(p));
          if (!word || !particle || toks.filter((w) => w === word).length !== 1) continue;
          const cloze = r.t.replace(word, word.slice(0, -particle.length) + "＿＿");
          const distract = shuffle(KO_PARTICLES.filter((p) => p !== particle && p !== "에서"), rand).slice(0, 3);
          items.push({ id: id("g", k), skill: "grammar", level, prompt: cloze, note: `المعنى · Meaning: ${r.ar ?? r.en}`, ...options(particle, distract) });
          made = true;
          continue;
        }
        const fws = NO_SPACE.has(language) ? toks.filter((w) => fwSet.has(w)) : toks.filter((w) => fwSet.has(key(w)) && w === w.toLowerCase());
        // Exactly one occurrence so the blank is unambiguous.
        const target = fws.find((w) => toks.filter((x) => key(x) === key(w)).length === 1);
        if (!target) continue;
        const cloze = blank(r.t, target, language);
        const distract = shuffle(functionWords.filter((w) => w !== key(target) && !toks.some((x) => key(x) === w)), rand).slice(0, 3);
        if (!cloze || distract.length < 3) continue;
        items.push({ id: id("g", k), skill: "grammar", level, prompt: cloze, note: `المعنى · Meaning: ${r.ar ?? r.en}`, ...options(target, distract) });
        made = true;
      }
    }

    // Reading and listening: choose the meaning of a sentence (read or heard).
    for (const skill of ["reading", "listening"] as const) {
      for (let k = 1; k <= PER_SKILL; k++) {
        const r = take((x) => tokenize(x.t, language).length >= (level === "A1" ? 3 : 5));
        if (!r) break;
        const arabic = !!r.ar;
        const others = shuffle(band.filter((x) => x.id !== r.id && (!arabic || x.ar) && meaningOf(x, arabic) !== meaningOf(r, arabic)), rand);
        const distract = [...new Set(others.map((x) => meaningOf(x, arabic)))].slice(0, 3);
        if (distract.length < 3) continue;
        const base = { id: id(skill === "reading" ? "r" : "l", k), skill, level, nativeOptions: true, ...options(meaningOf(r, arabic), distract) };
        items.push(
          skill === "reading"
            ? { ...base, passage: r.t, prompt: "ما معنى الجملة؟ · What does it mean?" }
            : { ...base, audio: r.t, prompt: "استمع: ما معنى ما سمعته؟ · Listen: what does it mean?" },
        );
      }
    }
  }
  return items;
}
