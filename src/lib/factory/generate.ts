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

export const LESSON_SIZE = 10;
export const MIN_LESSON_SIZE = 8;
export const LESSONS_PER_LEVEL = 300;
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

export function buildLesson(language: string, level: FactoryLevel, theme: Theme, n: number, rows: CorpusRow[], pool: CorpusRow[]): FactoryLesson {
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
  const vocabulary: VocabItem[] = byLength.slice(0, 5).map((r) => ({ term: r.t, meaning: m(r) }));
  const examples = rows.slice(0, 6).map((r) => ({ text: r.t, meaning: m(r) }));
  const pronunciation = byLength.slice(0, 2).map((r) => ({ text: r.t, tip: exampleTip(language) }));

  const [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9] = [...rows, ...rows];
  const shortOrdered = byLength.find((r) => order("x", r)) ?? s3;
  const matchRows: CorpusRow[] = [];
  for (const r of byLength) {
    if (matchRows.length < 3 && !matchRows.some((x) => m(x).en === m(r).en || x.t === r.t)) matchRows.push(r);
  }
  const exercises: Exercise[] = [listen("e1", s0), meaningChoice("e2", s1)];
  const e3 = fill("e3", s2) ?? meaningChoice("e3", s2);
  exercises.push(e3);
  exercises.push(order("e4", shortOrdered) ?? listen("e4", s3));
  if (matchRows.length === 3) exercises.push({ id: "e5", type: "match", pairs: matchRows.map((r) => [r.t, m(r)] as [string, L10n]) });
  exercises.push(translate("e6", byLength[0]));

  const quiz: Exercise[] = [
    listen("q1", s4),
    fill("q2", s5) ?? meaningChoice("q2", s5),
    dictation("q3", byLength[1] ?? s6),
    translate("q4", byLength[2] ?? s7),
    meaningChoice("q5", s8 ?? s9),
  ];

  return {
    id,
    unitId: `${language}-${lvl}-fu-${theme.id}`,
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
      review: rows.slice(0, 3).map((r) => ({ ar: `${r.t} — ${m(r).ar}`, en: `${r.t} — ${m(r).en}` })),
    },
    attribution: {
      source: "tatoeba",
      license: "CC BY 2.0 FR",
      sentences: rows.flatMap((r) => [{ id: r.id, by: r.u }, { id: r.enId }, ...(r.arId ? [{ id: r.arId }] : [])]).filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i),
    },
  };
}

/** Builds up to LESSONS_PER_LEVEL lessons for each CEFR level of one language. */
export function generateCourses(language: string, rows: CorpusRow[]): FactoryCourse[] {
  const lang = LANGUAGE_NAMES[language] ?? { ar: language, en: language };
  const courses: FactoryCourse[] = [];
  for (const [level, band] of bandRows(rows)) {
    const lvl = level.toLowerCase();
    const groups = [...assignThemes(band, level, language)].filter(([, rs]) => rs.length >= MIN_LESSON_SIZE);
    // Round-robin across themes so a capped level still covers every theme.
    const chunks = new Map<Theme, CorpusRow[][]>();
    for (const [theme, rs] of groups) {
      const cs: CorpusRow[][] = [];
      for (let i = 0; i + MIN_LESSON_SIZE <= rs.length; i += LESSON_SIZE) cs.push(rs.slice(i, i + LESSON_SIZE));
      chunks.set(theme, cs);
    }
    // Units follow the syllabus order; mixed practice comes last.
    const order = [...THEMES, MIXED];
    const picked = new Map<Theme, CorpusRow[][]>([...chunks.keys()].sort((a, b) => order.indexOf(a) - order.indexOf(b)).map((th) => [th, []]));
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
    const units: FactoryUnit[] = [];
    for (const [theme, cs] of picked) {
      if (!cs.length) continue;
      units.push({
        id: `${language}-${lvl}-fu-${theme.id}`,
        title: theme.title,
        lessons: cs.map((c, i) => buildLesson(language, level, theme, i + 1, c, band)),
      });
    }
    if (units.length) {
      courses.push({ id: `${language}-${lvl}`, language, level, title: { ar: `${lang.ar}: المستوى ${level}`, en: `${lang.en}: Level ${level}` }, units });
    }
  }
  return courses;
}
