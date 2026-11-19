/**
 * Answer normalisation and checking. Lenient on case, spacing, final
 * punctuation and apostrophe styles; German umlauts accept ae/oe/ue/ss.
 */
export function normalize(input: string, language?: string): string {
  let s = input
    .normalize("NFC")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,!?;:"“”„«»()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (language === "de") {
    s = s.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
  }
  return s;
}

export function matchesAny(answer: string, accepted: string[], language?: string): boolean {
  const a = normalize(answer, language);
  if (!a) return false;
  return accepted.some((x) => normalize(x, language) === a);
}
