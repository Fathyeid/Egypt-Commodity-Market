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

OUT = sys.argv[1] if len(sys.argv) > 1 else "public/images/landmarks"
UA = {"User-Agent": "LisanLandmarkFetcher/1.0 (educational language-learning site; contact via GitHub repository)"}
QUERIES = {
    "en": "Big Ben Westminster", "de": "Brandenburger Tor", "fr": "Tour Eiffel", "es": "Sagrada Familia",
    "it": "Colosseum Rome", "pt": "Torre de Belem", "tr": "Hagia Sophia", "ru": "Saint Basil's Cathedral",
    "zh": "Temple of Heaven", "ja": "Mount Fuji", "ko": "Gyeongbokgung", "ar": "Giza pyramids",
}
CATS = ["Featured pictures on Wikimedia Commons", "Quality images"]
OK_LICENSE = re.compile(r"^(cc0|public domain|pd|cc by(-sa)? [\d.]+)", re.I)


def api(params: dict) -> dict:
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"format": "json", **params})
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return json.load(r)


def strip(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html or "")).strip()


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    credits = {}
    for lang, q in QUERIES.items():
        chosen = None
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
        with urllib.request.urlopen(urllib.request.Request(ii["thumburl"], headers=UA), timeout=120) as r, open(f"{OUT}/{lang}.jpg", "wb") as f:
            f.write(r.read())
        credits[lang] = {
            "title": p["title"], "author": strip(meta.get("Artist", {}).get("value", ""))[:160],
            "license": lic, "licenseUrl": meta.get("LicenseUrl", {}).get("value", ""), "source": ii.get("descriptionurl", ""),
        }
        print(f"{lang}: {p['title']} ({lic})", flush=True)
    with open(f"{OUT}/credits.json", "w", encoding="utf-8") as f:
        json.dump(credits, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
