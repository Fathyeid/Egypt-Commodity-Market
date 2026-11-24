/** Reads the attributed sentence corpus shipped in data/tatoeba (see scripts/factory/extract_tatoeba.py). */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { applyArabicTranslations, germanArabicTranslations } from "./arabic-translations";
import type { CorpusRow } from "./generate";

export const CORPUS_DIR = join(process.cwd(), "data/tatoeba");

export function readCorpus(file: string): CorpusRow[] {
  const rows = gunzipSync(readFileSync(file))
    .toString("utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CorpusRow);
  return /(?:^|[\/])de\.jsonl\.gz$/.test(file) ? applyArabicTranslations(rows, germanArabicTranslations()) : rows;
}

export function corpusFile(language: string, dir = CORPUS_DIR) {
  const f = join(dir, `${language}.jsonl.gz`);
  return existsSync(f) ? f : null;
}
