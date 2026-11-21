import { describe, expect, it } from "vitest";
import { findText, textsFor } from "@/content";
import { tokenize } from "@/components/practice/tokenize";

const LANGS = ["en", "de", "fr", "es", "it", "pt", "tr", "ru", "zh", "ja", "ko", "ar"];

describe("listening and reading texts", () => {
  for (const lang of LANGS) {
    it(`${lang}: listening and reading at A1, A2 and B1, glossary words present in the text`, () => {
      for (const kind of ["listening", "reading"] as const) {
        const items = textsFor(lang, kind);
        expect(items.map((x) => x.level).sort()).toEqual(["A1", "A2", "B1"]);
        for (const item of items) {
          expect(findText(item.id)).toBe(item);
          const keys = Object.keys(item.glossary);
          const found = new Set(item.lines.flatMap((l) => tokenize(l, keys).map((tk) => tk.key)));
          const missing = keys.filter((k) => !found.has(k));
          expect(missing, `${item.id} glossary keys not found in text`).toEqual([]);
          for (const q of item.questions) {
            expect(q.answer).toBeLessThan(q.options.length);
            expect(new Set(q.options).size).toBe(q.options.length);
          }
        }
      }
    });
  }
});
