/** Splits a line into clickable word/phrase tokens and plain separators. Phrases in the glossary win over single words. */
export type Token = { text: string; key: string | null };

// \p{M}: Arabic tanween/harakat and other combining marks stay inside the word.
const WORD = /[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu;
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

const cjkKeys = (keys: string[]) => keys.filter((k) => CJK.test(k)).sort((a, b) => b.length - a.length);

function segmentCjk(run: string, keys: string[]): Token[] {
  const out: Token[] = [];
  let plain = "";
  for (let i = 0; i < run.length; ) {
    const hit = keys.find((k) => run.startsWith(k, i));
    if (hit) {
      if (plain) out.push({ text: plain, key: null });
      plain = "";
      out.push({ text: hit, key: hit });
      i += hit.length;
    } else {
      plain += run[i];
      i += 1;
    }
  }
  if (plain) out.push({ text: plain, key: null });
  return out;
}

/** Arabic attaches و/ف (and), ب (with), ل (for), ك (like) to the next word; fall back to the bare word. */
const AR_PREFIX = /^(?:[وف]?[بلك]?)(?=\p{Script=Arabic}{2})/u;
function lookup(word: string, keys: Set<string>): string | null {
  const w = word.toLowerCase();
  if (keys.has(w)) return w;
  const m = w.match(AR_PREFIX);
  for (let cut = m ? m[0].length : 0; cut > 0; cut--) if (keys.has(w.slice(cut))) return w.slice(cut);
  return null;
}

export function tokenize(line: string, glossaryKeys: string[]): Token[] {
  const keySet = new Set(glossaryKeys);
  const phrases = glossaryKeys.filter((k) => k.includes(" ")).map((k) => k.split(" "));
  const matches = [...line.matchAll(WORD)].map((m) => ({ text: m[0], start: m.index!, end: m.index! + m[0].length }));
  const out: Token[] = [];
  let cursor = 0;
  for (let i = 0; i < matches.length; i++) {
    // Longest glossary phrase starting at word i.
    let span = 1;
    let phrase: string | null = null;
    for (const p of phrases) {
      if (p.length > span && i + p.length <= matches.length && p.every((w, j) => (j === 0 ? lookup(matches[i].text, new Set([w])) === w : matches[i + j].text.toLowerCase() === w))) {
        span = p.length;
        phrase = p.join(" ");
      }
    }
    const first = matches[i];
    const last = matches[i + span - 1];
    if (first.start > cursor) out.push({ text: line.slice(cursor, first.start), key: null });
    if (span === 1 && CJK.test(first.text)) {
      // Chinese/Japanese have no spaces: find glossary entries inside the run, longest first.
      out.push(...segmentCjk(first.text, cjkKeys(glossaryKeys)));
      cursor = first.end;
      continue;
    }
    const text = line.slice(first.start, last.end);
    out.push({ text, key: phrase ?? lookup(text, keySet) ?? text.toLowerCase() });
    cursor = last.end;
    i += span - 1;
  }
  if (cursor < line.length) out.push({ text: line.slice(cursor), key: null });
  return out;
}
