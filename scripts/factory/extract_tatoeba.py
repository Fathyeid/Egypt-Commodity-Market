#!/usr/bin/env python3
"""
Builds a compact, attributed sentence corpus per language from Tatoeba's open exports.

Runs on GitHub Actions (the dev sandbox can't reach downloads.tatoeba.org).
Tatoeba sentences are CC BY 2.0 FR: every record keeps its sentence ids (and the
contributor's username when available) so the app can credit each sentence.

Output: data/tatoeba/<lang2>.jsonl.gz, one JSON object per line:
  {"id": 123, "t": "target sentence", "u": "username",
   "en": "English translation", "enId": 456,
   "ar": "Arabic translation", "arId": 789,   # only when a direct link exists
   "alt": ["other target sentences that translate the same English sentence"],
   "d": 0.42}                                   # difficulty, 0 (easiest) .. 1
plus data/tatoeba/manifest.json with counts and the export date.
"""
import bz2
import gzip
import io
import json
import math
import os
import re
import sys
import tarfile
import unicodedata
import urllib.request
from collections import Counter, defaultdict
from datetime import date, timezone, datetime

LANGS = {  # Tatoeba ISO 639-3 -> app code
    "eng": "en", "deu": "de", "fra": "fr", "spa": "es", "ita": "it", "por": "pt",
    "tur": "tr", "rus": "ru", "cmn": "zh", "jpn": "ja", "kor": "ko", "ara": "ar",
}
NO_SPACE = {"cmn", "jpn"}
MAX_PAIRS = int(os.environ.get("MAX_PAIRS", "25000"))
BASE = "https://downloads.tatoeba.org/exports"
OUT = sys.argv[1] if len(sys.argv) > 1 else "data/tatoeba"
CACHE = os.environ.get("TATOEBA_CACHE", "/tmp/tatoeba")


def fetch(url: str, dest: str) -> bool:
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "lisan-content-factory"})
        with urllib.request.urlopen(req, timeout=600) as r, open(dest + ".part", "wb") as f:
            while chunk := r.read(1 << 20):
                f.write(chunk)
        os.replace(dest + ".part", dest)
        return True
    except Exception as e:  # noqa: BLE001 - report and continue
        print(f"  ! {url}: {e}", flush=True)
        return False


def tokens(text: str, l3: str) -> list[str]:
    if l3 in NO_SPACE:
        return [c for c in text if unicodedata.category(c)[0] == "L"]
    return re.findall(r"[^\W\d_]+(?:['’-][^\W\d_]+)*", text.lower())


GOOD = re.compile(r"^[^<>{}\[\]#@=|\\/~^*_]+$")


def acceptable(text: str, l3: str) -> bool:
    if not GOOD.match(text) or "http" in text:
        return False
    n = len(tokens(text, l3))
    if l3 in NO_SPACE:
        return 2 <= n <= 40
    return 2 <= n <= 22 and len(text) <= 160


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", text)).strip()


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(CACHE, exist_ok=True)

    sent: dict[int, tuple[str, str]] = {}   # id -> (l3, text)
    user: dict[int, str] = {}
    for l3 in LANGS:
        det = f"{CACHE}/{l3}_detailed.tsv.bz2"
        plain = f"{CACHE}/{l3}.tsv.bz2"
        path, detailed = None, False
        if fetch(f"{BASE}/per_language/{l3}/{l3}_sentences_detailed.tsv.bz2", det):
            path, detailed = det, True
        elif fetch(f"{BASE}/per_language/{l3}/{l3}_sentences.tsv.bz2", plain):
            path = plain
        if not path:
            print(f"{l3}: no export, skipped", flush=True)
            continue
        n = 0
        with bz2.open(path, "rt", encoding="utf-8", errors="replace") as f:
            for line in f:
                parts = line.rstrip("\n").split("\t")
                if len(parts) < 3:
                    continue
                try:
                    sid = int(parts[0])
                except ValueError:
                    continue
                sent[sid] = (l3, norm(parts[2]))
                if detailed and len(parts) >= 4 and parts[3] not in ("", "\\N"):
                    user[sid] = parts[3]
                n += 1
        print(f"{l3}: {n} sentences (detailed={detailed})", flush=True)

    links_path = f"{CACHE}/links.tar.bz2"
    if not fetch(f"{BASE}/links.tar.bz2", links_path):
        sys.exit("links export unavailable")
    to_en: dict[int, list[int]] = defaultdict(list)
    to_ar: dict[int, list[int]] = defaultdict(list)
    with tarfile.open(links_path, "r:bz2") as tar:
        member = next(m for m in tar.getmembers() if m.isfile())
        fobj = tar.extractfile(member)
        assert fobj is not None
        for raw in io.TextIOWrapper(fobj, encoding="utf-8"):
            a, _, b = raw.rstrip("\n").partition("\t")
            try:
                a_id, b_id = int(a), int(b)
            except ValueError:
                continue
            sa, sb = sent.get(a_id), sent.get(b_id)
            if not sa or not sb or sa[0] == sb[0]:
                continue
            if sb[0] == "eng":
                to_en[a_id].append(b_id)
            elif sb[0] == "ara":
                to_ar[a_id].append(b_id)
    print(f"links: {len(to_en)} sentences with English, {len(to_ar)} with Arabic", flush=True)

    manifest = {"source": "Tatoeba (https://tatoeba.org)", "license": "CC BY 2.0 FR",
                "exported": datetime.now(timezone.utc).date().isoformat(), "languages": {}}
    by_lang: dict[str, list[int]] = defaultdict(list)
    for sid, (l3, _) in sent.items():
        by_lang[l3].append(sid)

    for l3, l2 in LANGS.items():
        ids = by_lang.get(l3, [])
        if not ids:
            continue
        freq = Counter()
        for sid in ids:
            freq.update(tokens(sent[sid][1], l3))
        rank = {w: i + 1 for i, (w, _) in enumerate(freq.most_common())}
        vocab_size = max(len(rank), 1)

        # English is the pivot; for English itself the pivot meaning is Arabic.
        pivot = to_ar if l3 == "eng" else to_en
        # Reverse index: English sentence -> all target sentences that translate it.
        same_meaning: dict[int, list[int]] = defaultdict(list)
        if l3 != "eng":
            for sid in ids:
                for e in to_en.get(sid, ()):
                    same_meaning[e].append(sid)

        seen: set[str] = set()
        rows = []
        for sid in sorted(ids):
            text = sent[sid][1]
            key = text.lower().rstrip(".!?。！？")
            if key in seen or not acceptable(text, l3) or not pivot.get(sid):
                continue
            seen.add(key)
            toks = tokens(text, l3)
            ranks = sorted(rank.get(t, vocab_size) for t in toks)
            # Hardest-word rank (log-scaled) dominates; length adds a little.
            hard = math.log(ranks[-1] + 1) / math.log(vocab_size + 1)
            length = min(len(toks) / (30 if l3 in NO_SPACE else 15), 1.0)
            row = {"id": sid, "t": text, "d": round(0.75 * hard + 0.25 * length, 4)}
            if sid in user:
                row["u"] = user[sid]
            if l3 == "eng":
                a = to_ar[sid][0]
                row.update(en=text, enId=sid, ar=sent[a][1], arId=a)
            else:
                e = to_en[sid][0]
                row.update(en=sent[e][1], enId=e)
                if to_ar.get(sid):
                    a = to_ar[sid][0]
                    row.update(ar=sent[a][1], arId=a)
                alt = sorted({sent[o][1] for o in same_meaning[e] if o != sid and acceptable(sent[o][1], l3)})
                if alt:
                    row["alt"] = alt[:4]
            rows.append(row)

        # Keep an even spread across difficulty so every level has material.
        rows.sort(key=lambda r: r["d"])
        if len(rows) > MAX_PAIRS:
            step = len(rows) / MAX_PAIRS
            rows = [rows[int(i * step)] for i in range(MAX_PAIRS)]
        with gzip.open(f"{OUT}/{l2}.jsonl.gz", "wt", encoding="utf-8", compresslevel=9) as f:
            for r in rows:
                f.write(json.dumps(r, ensure_ascii=False, separators=(",", ":")) + "\n")
        withar = sum(1 for r in rows if "ar" in r)
        manifest["languages"][l2] = {"sentences": len(ids), "pairs": len(rows), "withArabic": withar}
        print(f"{l2}: kept {len(rows)} pairs ({withar} with Arabic)", flush=True)

    with open(f"{OUT}/manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
