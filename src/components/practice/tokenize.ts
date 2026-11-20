/** Splits a line into clickable word/phrase tokens and plain separators. Phrases in the glossary win over single words. */
export type Token = { text: string; key: string | null };

const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;

export function tokenize(line: string, glossaryKeys: string[]): Token[] {
  const phrases = glossaryKeys.filter((k) => k.includes(" ")).map((k) => k.split(" "));
  const matches = [...line.matchAll(WORD)].map((m) => ({ text: m[0], start: m.index!, end: m.index! + m[0].length }));
  const out: Token[] = [];
  let cursor = 0;
  for (let i = 0; i < matches.length; i++) {
    // Longest glossary phrase starting at word i.
    let span = 1;
    for (const p of phrases) {
      if (p.length > span && i + p.length <= matches.length && p.every((w, j) => matches[i + j].text.toLowerCase() === w)) span = p.length;
    }
    const first = matches[i];
    const last = matches[i + span - 1];
    if (first.start > cursor) out.push({ text: line.slice(cursor, first.start), key: null });
    const text = line.slice(first.start, last.end);
    out.push({ text, key: text.toLowerCase() });
    cursor = last.end;
    i += span - 1;
  }
  if (cursor < line.length) out.push({ text: line.slice(cursor), key: null });
  return out;
}
