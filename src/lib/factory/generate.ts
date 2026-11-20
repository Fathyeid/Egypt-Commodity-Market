/**
 * Content factory: turns an attributed sentence corpus (data/tatoeba/<lang>.jsonl.gz,
 * built by scripts/factory/extract_tatoeba.py) into draft lessons.
 *
 * Deterministic: the same corpus always yields the same lessons and ids. Every
 * exercise is built from real, human-translated sentences; nothing is invented.
 * Lessons are drafts until an admin approves them.
 */
import type { Exercise, L10n, Lesson, VocabItem } from "@/content/types";
import { normalize } from "@/lib/grading";
import blocklist from "../../../scripts/factory/blocklist.json";
import { FACTORY_LEVELS, MIXED, THEMES, matchesTheme, themesFor, type FactoryLevel, type Theme } from "./syllabus";

export type CorpusRow = {
  id: number;
  t: string;
  u?: string;
  en: string;
  enId: number;
  ar?: string;
  arId?: number;
  alt?: string[];
  d: number;
};

export type Attribution = { source: "tatoeba"; license: "CC BY 2.0 FR"; sentences: { id: number; by?: string }[] };

export type FactoryLesson = {
  id: string;
  unitId: string;
  title: L10n;
  goal: L10n;
  content: Omit<Lesson, "id" | "title" | "goal">;
  attribution: Attribution;
};
export type FactoryUnit = { id: string; title: L10n; lessons: FactoryLesson[] };
export type FactoryCourse = { id: string; language: string; level: FactoryLevel; title: L10n; units: FactoryUnit[] };

export const LESSON_SIZE = 14;
export const MIN_LESSON_SIZE = 10;
export const LESSONS_PER_LEVEL = 700;
/** Big themes are split into units of at most this many lessons. */
export const UNIT_SIZE = 20;
const NO_SPACE = new Set(["zh", "ja"]);

export const LANGUAGE_NAMES: Record<string, L10n> = {
  en: { ar: "الإنجليزية", en: "English" }, de: { ar: "الألمانية", en: "German" }, fr: { ar: "الفرنسية", en: "French" },
  es: { ar: "الإسبانية", en: "Spanish" }, it: { ar: "الإيطالية", en: "Italian" }, pt: { ar: "البرتغالية", en: "Portuguese" },
  tr: { ar: "التركية", en: "Turkish" }, ru: { ar: "الروسية", en: "Russian" }, zh: { ar: "الصينية", en: "Chinese" },
  ja: { ar: "اليابانية", en: "Japanese" }, ko: { ar: "الكورية", en: "Korean" }, ar: { ar: "العربية", en: "Arabic" },
};

/** Small deterministic PRNG so lessons don't change between builds. */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** What a learner sees as the meaning of a sentence, in each interface language. */
export function meaningOf(row: CorpusRow, language: string): L10n {
  if (language === "en") return { ar: row.ar ?? row.en, en: row.ar ?? row.en };
  return { ar: row.ar ?? row.en, en: row.en };
}

const TERMINAL = /[\s.!?…。！？]+$/u;
const PUNCT_ONLY = /^[\p{P}\p{S}]+$/u;
function words(text: string): string[] {
  return text.replace(TERMINAL, "").split(/\s+/).filter((w) => w && !PUNCT_ONLY.test(w));
}
function bareWord(w: string): string {
  return w.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "");
}

const BLOCK = new RegExp(`\\b(?:${blocklist.words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i");
/** Keeps unsuitable sentences out of lessons (checked on the English side). */
export const isSuitable = (row: CorpusRow) => !BLOCK.test(row.en) && !BLOCK.test(row.t);

/** Splits rows into six difficulty bands (A1..C2) by corpus difficulty quantile. */
export function bandRows(rows: CorpusRow[]): Map<FactoryLevel, CorpusRow[]> {
  const sorted = rows.filter(isSuitable).sort((a, b) => a.d - b.d || a.id - b.id);
  const out = new Map<FactoryLevel, CorpusRow[]>();
  FACTORY_LEVELS.forEach((lvl, i) => {
    out.set(lvl, sorted.slice(Math.floor((i * sorted.length) / 6), Math.floor(((i + 1) * sorted.length) / 6)));
  });
  return out;
}

function assignThemes(rows: CorpusRow[], level: FactoryLevel, language: string): Map<Theme, CorpusRow[]> {
  // Newly introduced themes first so each level feels like a step forward.
  const themes = themesFor(level).sort((a, b) => Number(b.from === level) - Number(a.from === level));
  const out = new Map<Theme, CorpusRow[]>();
  for (const row of rows) {
    const english = language === "en" ? row.t : row.en;
    const theme = themes.find((th) => matchesTheme(th, english)) ?? MIXED;
    const list = out.get(theme) ?? [];
    list.push(row);
    out.set(theme, list);
  }
  return out;
}

function exampleTip(language: string): L10n {
  return NO_SPACE.has(language)
    ? { ar: "استمع للجملة كاملة ثم كرّرها مقطعاً مقطعاً بنفس النغمة.", en: "Listen to the whole sentence, then repeat it syllable by syllable with the same tone." }
    : { ar: "استمع ثم كرّر الجملة بنفس السرعة والإيقاع، واربط الكلمات ببعضها.", en: "Listen, then repeat at the same speed and rhythm, linking the words together." };
}

export function buildLesson(language: string, level: FactoryLevel, theme: Theme, n: number, rows: CorpusRow[], pool: CorpusRow[], unitId?: string): FactoryLesson {
  const lvl = level.toLowerCase();
  const id = `${language}-${lvl}-f-${theme.id}-${n}`;
  const rand = rng(id);
  const lang = LANGUAGE_NAMES[language] ?? { ar: language, en: language };
  const m = (r: CorpusRow) => meaningOf(r, language);
  const byLength = [...rows].sort((a, b) => a.t.length - b.t.length);
  const spaced = !NO_SPACE.has(language);

  const others = (row: CorpusRow, k: number) => {
    const key = normalize(row.t, language);
    const out: CorpusRow[] = [];
    for (let tries = 0; out.length < k && tries < 50; tries++) {
      const p = pool[Math.floor(rand() * pool.length)];
      const pk = normalize(p.t, language);
      if (pk !== key && !out.some((o) => normalize(o.t, language) === pk)) out.push(p);
    }
    return out;
  };
  const listen = (eid: string, row: CorpusRow): Exercise => {
    const opts = shuffle([row, ...others(row, 2)], rand);
    return { id: eid, type: "listen", audio: row.t, prompt: { ar: "ماذا سمعت؟", en: "What did you hear?" }, options: opts.map((o) => o.t), answer: opts.indexOf(row) };
  };
  const meaningChoice = (eid: string, row: CorpusRow): Exercise => {
    const opts = shuffle([row, ...others(row, 2)], rand);
    return { id: eid, type: "mcq", prompt: "…", hint: { ar: `أي جملة تعني: «${m(row).ar}»؟`, en: `Which sentence means: “${m(row).en}”?` }, options: opts.map((o) => o.t), answer: opts.indexOf(row) };
  };
  const translate = (eid: string, row: CorpusRow): Exercise => ({
    id: eid,
    type: "translate",
    prompt: { ar: `اكتب بال${lang.ar.replace(/^ال/, "")}: «${m(row).ar}»`, en: `Write in ${lang.en}: “${m(row).en}”` },
    answers: [row.t, ...(row.alt ?? [])],
  });
  const dictation = (eid: string, row: CorpusRow): Exercise => ({ id: eid, type: "dictation", audio: row.t, answers: [row.t, ...(row.alt ?? [])] });

  /** Cloze: blank one real word (not the first) that appears elsewhere in the lesson if possible. */
  const fill = (eid: string, row: CorpusRow): Exercise | null => {
    if (!spaced) return null;
    const ws = words(row.t).map(bareWord).filter(Boolean);
    const candidates = ws.slice(1).filter((w) => w.length >= 3 && !/\d/.test(w));
    if (!candidates.length) return null;
    const re = (w: string, flags: string) => new RegExp(`(^|[\\s\\p{P}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[\\s\\p{P}]|$)`, flags);
    const common = candidates.find((w) => rows.some((r) => r !== row && re(w, "iu").test(r.t)));
    const word = common ?? [...candidates].sort((a, b) => b.length - a.length)[0];
    const hit = re(word, "u").exec(row.t);
    if (!hit) return null;
    const idx = hit.index + hit[1].length;
    const prompt = row.t.slice(0, idx) + "___" + row.t.slice(idx + word.length);
    return { id: eid, type: "fill", prompt, hint: m(row), answers: [word] };
  };
  const order = (eid: string, row: CorpusRow): Exercise | null => {
    if (!spaced) return null;
    const ws = words(row.t);
    if (ws.length < 3 || ws.length > 9) return null;
    const answer = ws.join(" ");
    return { id: eid, type: "order", hint: m(row), words: shuffle(ws, rand), answers: [answer] };
  };

  // Vocabulary: the shortest sentences double as useful phrases.
  const vocabulary: VocabItem[] = byLength.slice(0, 8).map((r) => ({ term: r.t, meaning: m(r) }));
  const examples = rows.map((r) => ({ text: r.t, meaning: m(r) }));
  const pronunciation = byLength.slice(0, 4).map((r) => ({ text: r.t, tip: exampleTip(language) }));

  // Practice: every sentence gets an exercise, rotating through the exercise types.
  const kinds = ["listen", "meaning", "fill", "order", "translate", "dictation"] as const;
  const make = (kind: (typeof kinds)[number], eid: string, row: CorpusRow): Exercise =>
    kind === "listen" ? listen(eid, row)
    : kind === "meaning" ? meaningChoice(eid, row)
    : kind === "fill" ? (fill(eid, row) ?? meaningChoice(eid, row))
    : kind === "order" ? (order(eid, row) ?? listen(eid, row))
    : kind === "translate" ? translate(eid, row)
    : dictation(eid, row);
  const exercises: Exercise[] = rows.map((r, i) => make(kinds[i % kinds.length], `e${i + 1}`, r));
  const matchRows: CorpusRow[] = [];
  for (const r of byLength) {
    if (matchRows.length < 4 && !matchRows.some((x) => m(x).en === m(r).en || x.t === r.t)) matchRows.push(r);
  }
  if (matchRows.length >= 3) exercises.splice(3, 0, { id: "e0", type: "match", pairs: matchRows.map((r) => [r.t, m(r)] as [string, L10n]) });

  // Quiz: 8 questions on the same sentences, each with a different exercise type than in practice.
  const quiz: Exercise[] = rows.slice(0, 8).map((r, i) => make(kinds[(i + 3) % kinds.length], `q${i + 1}`, r));

  return {
    id,
    unitId: unitId ?? `${language}-${lvl}-fu-${theme.id}`,
    title: { ar: `${theme.title.ar} (${n})`, en: `${theme.title.en} (${n})` },
    goal: {
      ar: `أن تفهم وتبني ${rows.length} جمل حقيقية عن «${theme.title.ar}» في المستوى ${level}.`,
      en: `Understand and build ${rows.length} real sentences about “${theme.title.en}” at level ${level}.`,
    },
    content: {
      explanation: {
        ar: `هذا درس تدريبي مبني على جمل حقيقية كتبها وترجمها متطوعون في مشروع Tatoeba المفتوح. استمع لكل جملة، افهم معناها، ثم ابنِها بنفسك.`,
        en: `This practice lesson is built from real sentences written and translated by volunteers of the open Tatoeba project. Listen to each sentence, understand it, then build it yourself.`,
      },
      vocabulary,
      pronunciation,
      examples,
      grammar: {
        title: { ar: "لاحظ الأنماط", en: "Notice the patterns" },
        body: {
          ar: "قارن الجمل في هذا الدرس: لاحظ ترتيب الكلمات وأين يأتي الفعل، وكيف تتغير الكلمات حسب المعنى. شرح القاعدة بالتفصيل في درس القواعد المرتبط عند توفّره.",
          en: "Compare the sentences in this lesson: notice the word order, where the verb goes and how words change with meaning. The linked grammar topic explains the rule in detail when available.",
        },
      },
      exercises,
      quiz,
      review: rows.slice(0, 5).map((r) => ({ ar: `${r.t} — ${m(r).ar}`, en: `${r.t} — ${m(r).en}` })),
    },
    attribution: {
      source: "tatoeba",
      license: "CC BY 2.0 FR",
      sentences: rows.flatMap((r) => [{ id: r.id, by: r.u }, { id: r.enId }, ...(r.arId ? [{ id: r.arId }] : [])]).filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i),
    },
  };
}

export type PlannedLesson = { id: string; n: number; theme: Theme; unitId: string; rows: CorpusRow[] };
export type PlannedUnit = { id: string; title: L10n; lessons: PlannedLesson[] };
export type PlannedLevel = { id: string; level: FactoryLevel; title: L10n; band: CorpusRow[]; units: PlannedUnit[] };

/**
 * Plans each CEFR level (which sentences go into which lesson and unit) without building
 * lesson content. Cheap enough to run at request time; lessons are built on demand.
 */
export function planCourses(language: string, rows: CorpusRow[]): PlannedLevel[] {
  const lang = LANGUAGE_NAMES[language] ?? { ar: language, en: language };
  const levels: PlannedLevel[] = [];
  for (const [level, band] of bandRows(rows)) {
    const lvl = level.toLowerCase();
    const groups = [...assignThemes(band, level, language)].filter(([, rs]) => rs.length >= MIN_LESSON_SIZE);
    // When a language has too few sentences for the target, lessons overlap by half (each
    // sentence then appears in two lessons, practised with different exercises).
    const chunkWith = (step: number) => {
      const out = new Map<Theme, CorpusRow[][]>();
      for (const [theme, rs] of groups) {
        const cs: CorpusRow[][] = [];
        for (let i = 0; i + MIN_LESSON_SIZE <= rs.length; i += step) cs.push(rs.slice(i, i + LESSON_SIZE));
        out.set(theme, cs);
      }
      return out;
    };
    let chunks = chunkWith(LESSON_SIZE);
    if ([...chunks.values()].reduce((n, cs) => n + cs.length, 0) < LESSONS_PER_LEVEL) chunks = chunkWith(Math.ceil(LESSON_SIZE / 2));
    // Round-robin across themes so a capped level still covers every theme. Themes new at this
    // level come first; themes from earlier levels follow as "review & expand"; mixed practice last.
    const order = [...THEMES, MIXED];
    const rank = (th: Theme) => (th === MIXED ? 2 : th.from === level ? 0 : 1) * 1000 + order.indexOf(th);
    const picked = new Map<Theme, CorpusRow[][]>([...chunks.keys()].sort((a, b) => rank(a) - rank(b)).map((th) => [th, []]));
    let total = 0;
    for (let round = 0; total < LESSONS_PER_LEVEL; round++) {
      let any = false;
      for (const [theme, cs] of chunks) {
        if (round < cs.length && total < LESSONS_PER_LEVEL) {
          picked.get(theme)!.push(cs[round]);
          total++;
          any = true;
        }
      }
      if (!any) break;
    }
    const units: PlannedUnit[] = [];
    for (const [theme, cs] of picked) {
      if (!cs.length) continue;
      const review = theme !== MIXED && theme.from !== level;
      const base = review ? { ar: `مراجعة وتوسّع: ${theme.title.ar}`, en: `Review & expand: ${theme.title.en}` } : theme.title;
      // Split evenly so no unit ends up with a single lesson.
      const parts = Math.ceil(cs.length / UNIT_SIZE);
      const size = Math.ceil(cs.length / parts);
      for (let start = 0, part = 1; start < cs.length; start += size, part++) {
        const unitId = `${language}-${lvl}-fu-${theme.id}${part > 1 ? `-${part}` : ""}`;
        const title = parts > 1 ? { ar: `${base.ar} (${part})`, en: `${base.en} (${part})` } : base;
        units.push({
          id: unitId,
          title,
          lessons: cs.slice(start, start + size).map((c, i) => ({ id: `${language}-${lvl}-f-${theme.id}-${start + i + 1}`, n: start + i + 1, theme, unitId, rows: c })),
        });
      }
    }
    if (units.length) levels.push({ id: `${language}-${lvl}`, level, title: { ar: `${lang.ar}: المستوى ${level}`, en: `${lang.en}: Level ${level}` }, band, units });
  }
  return levels;
}

export function buildPlannedLesson(language: string, level: PlannedLevel, l: PlannedLesson): FactoryLesson {
  return buildLesson(language, level.level, l.theme, l.n, l.rows, level.band, l.unitId);
}

/** Builds every lesson (seed metadata, tests and reports). */
export function generateCourses(language: string, rows: CorpusRow[]): FactoryCourse[] {
  return planCourses(language, rows).map((lv) => ({
    id: lv.id,
    language,
    level: lv.level,
    title: lv.title,
    units: lv.units.map((u) => ({ id: u.id, title: u.title, lessons: u.lessons.map((l) => buildPlannedLesson(language, lv, l)) })),
  }));
}
