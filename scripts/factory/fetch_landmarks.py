#!/usr/bin/env python3
"""
Downloads one freely licensed landmark photo per language from Wikimedia Commons
(public/images/landmarks/<lang>.jpg) with attribution in credits.json.
Runs on GitHub Actions (Commons isn't reachable from the dev sandbox).
Only CC0 / public domain / CC BY / CC BY-SA photos from Commons' quality or featured sets.
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import urllib.error
import time

OUT = sys.argv[1] if len(sys.argv) > 1 else "public/images/landmarks"
UA = {"User-Agent": "LisanLandmarkFetcher/1.0 (educational language-learning site; contact via GitHub repository)"}
# (search, a word the file title must contain)
QUERIES = {
    "en": ("Big Ben Westminster", "big ben"), "de": ("Brandenburger Tor", "brandenburg"), "fr": ("Tour Eiffel", "eiffel"),
    "es": [("Alhambra Granada", "alhambra"), ("Plaza de Espana Sevilla", "sevill"), ("Sagrada Familia facade", "sagrada")], "it": ("Colosseum Rome", "colos"), "pt": ("Torre de Belem Lisboa", "bel"),
    "tr": ("Hagia Sophia", "hagia"), "ru": ("Saint Basil's Cathedral Moscow", "basil"), "zh": [("Temple of Heaven Beijing", "heaven"), ("Great Wall of China", "great wall"), ("Forbidden City", "forbidden")],
    "ja": [("Mount Fuji", "fuji"), ("Kinkaku-ji", "kinkaku"), ("Fushimi Inari", "fushimi")], "ko": ("Gyeongbokgung", "gyeongbok"), "ar": ("Giza pyramids", "giza"),
}
CATS = ["Featured pictures on Wikimedia Commons", "Quality images", "Valued images sorted by promotion date"]
EXCLUDE = re.compile(r"grumman|hawkeye|aircraft|navy|military|jet|plane|mural|interior|ceiling|inside|nave|vault|detail", re.I)
OK_LICENSE = re.compile(r"^(cc0|public domain|pd|cc by(-sa)? [\d.]+)", re.I)


def fetch(url: str) -> bytes:
    """GET with polite pacing and backoff on 429/5xx (Wikimedia rate-limits bursts)."""
    for attempt in range(6):
        time.sleep(1.5)
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < 5:
                time.sleep(10 * (attempt + 1))
                continue
            raise
    raise RuntimeError("unreachable")


def api(params: dict) -> dict:
    return json.loads(fetch("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"format": "json", "formatversion": 1, **params})))


def strip(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html or "")).strip()


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    cred_file = f"{OUT}/credits.json"
    credits = json.load(open(cred_file, encoding="utf-8")) if os.path.exists(cred_file) else {}
    for lang, spec in QUERIES.items():
        if lang in credits and os.path.exists(f"{OUT}/{lang}.jpg") and not os.environ.get("FORCE"):
            continue  # keep photos already chosen
        chosen = None
        for q, must in (spec if isinstance(spec, list) else [spec]):
          if chosen:
            break
          for cat in CATS:
              res = api({
                  "action": "query", "generator": "search", "gsrnamespace": 6, "gsrlimit": 20,
                  "gsrsearch": f'{q} incategory:"{cat}" filetype:bitmap',
                  "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 1280,
              })
              pages = sorted(res.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
              for p in pages:
                  ii = (p.get("imageinfo") or [{}])[0]
                  meta = ii.get("extmetadata", {})
                  lic = meta.get("LicenseShortName", {}).get("value", "")
                  if must not in p.get("title", "").lower().replace("é", "e").replace("_", " ") or EXCLUDE.search(p.get("title", "")):
                      continue
                  if ii.get("mime") != "image/jpeg" or not OK_LICENSE.match(lic):
                      continue
                  if ii.get("width", 0) < ii.get("height", 1) * 1.2:  # want a landscape banner
                      continue
                  chosen = (p, ii, meta, lic)
                  break
              if chosen:
                  break
        if not chosen:
            print(f"{lang}: no suitable photo", flush=True)
            continue
        p, ii, meta, lic = chosen
        with open(f"{OUT}/{lang}.jpg", "wb") as f:
            f.write(fetch(ii["thumburl"]))
        credits[lang] = {
            "title": p["title"], "author": strip(meta.get("Artist", {}).get("value", ""))[:160],
            "license": lic, "licenseUrl": meta.get("LicenseUrl", {}).get("value", ""), "source": ii.get("descriptionurl", ""),
        }
        print(f"{lang}: {p['title']} ({lic})", flush=True)
    with open(f"{OUT}/credits.json", "w", encoding="utf-8") as f:
        json.dump(credits, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
