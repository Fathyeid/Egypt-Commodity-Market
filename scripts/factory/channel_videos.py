#!/usr/bin/env python3
"""
Builds lesson videos from the biggest language-teaching channels on YouTube.

Cheap on quota by design (the free YouTube Data API allows 10,000 units a day):
  * channels are looked up by handle (1 unit each) — no 100-unit searches;
  * each channel's uploads are listed 50 per call (1 unit);
  * only the videos we pick are checked for embeddability and length (50 per unit).

For every language it keeps the 3 largest channels (by subscribers) among the
candidates below, then matches video titles to:
  * grammar topics  → data/channel-videos.json "topics"  (one video per topic)
  * unit themes     → data/channel-videos.json "themes"  (a list, so each lesson in a
                      unit can get a different video)
"""
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

API = os.environ.get("YOUTUBE_API_BASE", "https://www.googleapis.com/youtube/v3")
KEY = os.environ.get("YOUTUBE_API_KEY", "")
PAGES = int(os.environ.get("UPLOAD_PAGES", "8"))  # 50 uploads per page
PER_LANGUAGE = 3
THEME_VIDEOS = 24  # distinct videos kept per unit theme

# Well-known teaching channels (handles are verified at run time; missing ones are skipped).
CANDIDATES = {
    "en": ["EnglishClass101", "bbclearningenglish", "EnglishwithLucy", "mmmEnglish", "engvid", "LearnEnglishWithTVSeries", "rachelsenglish"],
    "de": ["GermanPod101", "LearnGermanwithJenny", "EasyGerman", "DeutschFuerEuch", "dwlearngerman", "LingodaGerman"],
    "fr": ["FrenchPod101", "EasyFrench", "francaisavecpierre", "LearnFrenchwithAlexa", "innerfrench", "Frenchwithvincent"],
    "es": ["SpanishPod101", "EasySpanish", "butterflyspanish", "DreamingSpanish", "SpanishwithVicente", "Spanishland"],
    "it": ["ItalianPod101", "EasyItalian", "LearnItalianwithLucrezia", "ItalianoAutomatico", "Italianwithvincenzo"],
    "pt": ["PortuguesePod101", "EasyPortuguese", "SpeakingBrazilian", "PracticePortuguese", "PortuguesewithLeo"],
    "tr": ["TurkishClass101", "EasyTurkish", "TurkishwithAylin", "TurkishTeatime", "Speakturkishwithme"],
    "ru": ["RussianPod101", "EasyRussian", "RussianWithMax", "RealRussianClub", "RussianFromRussia"],
    "zh": ["ChineseClass101", "MandarinCorner", "YoyoChinese", "EverydayChinese", "LittleFoxChinese"],
    "ja": ["JapanesePod101", "JapaneseAmmowithMisa", "NihongoNoMori", "Japanesewithshun", "Comprehensiblejapanese"],
    "ko": ["KoreanClass101", "talktomeinkorean", "GoBillyKorean", "KoreanUnnie", "KoreanJun"],
    "ar": ["ArabicPod101", "LearnArabicwithMaha", "ArabicSimplified", "EasyArabic", "ArabicOnline"],
}

STOP = set("""a an the and or of to in on at for with by is are am be as from your you how what when
why this that these those it its into about learn lesson lessons part video videos episode
beginner beginners intermediate advanced easy basic basics grammar vocabulary language
english german french spanish italian portuguese turkish russian chinese japanese korean arabic
mandarin brazilian european verb verbs word words phrase phrases common useful most top""".split())


class QuotaExceeded(Exception):
    pass


units_used = 0


def call(endpoint: str, cost: int = 1, **params) -> dict:
    global units_used
    params["key"] = KEY
    url = f"{API}/{endpoint}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "lisan-channel-videos"}), timeout=30) as r:
            units_used += cost
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        if e.code == 403 and "quota" in body.lower():
            raise QuotaExceeded() from e
        print(f"  ! {endpoint} {e.code}: {body[:200]}", flush=True)
        return {}


def words(text: str) -> set[str]:
    return {w for w in re.findall(r"[a-z]+", text.lower()) if len(w) > 2 and w not in STOP}


def seconds(iso: str) -> int:
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m:
        return 0
    d, h, mi, s = (int(x) if x else 0 for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + s


LEVEL_HINTS = {
    "A1": ["beginner", "absolute", "a1", "basics", "first"],
    "A2": ["beginner", "a2", "elementary"],
    "B1": ["intermediate", "b1"],
    "B2": ["intermediate", "upper", "b2"],
    "C1": ["advanced", "c1"],
    "C2": ["advanced", "c2", "native", "fluent"],
}


def main() -> None:
    if not KEY:
        sys.exit("YOUTUBE_API_KEY is not set")
    inp, out_file = json.load(open(sys.argv[1], encoding="utf-8")), sys.argv[2]
    already = json.load(open(sys.argv[3], encoding="utf-8")) if len(sys.argv) > 3 and os.path.exists(sys.argv[3]) else {}
    result = {"channels": {}, "topics": {}, "themes": {}}

    try:
        for lang, handles in CANDIDATES.items():
            found = []
            for h in handles:
                info = call("channels", part="snippet,statistics,contentDetails", forHandle=f"@{h}")
                for c in info.get("items", []):
                    found.append({
                        "id": c["id"], "title": c["snippet"]["title"],
                        "subs": int(c.get("statistics", {}).get("subscriberCount", 0) or 0),
                        "uploads": c.get("contentDetails", {}).get("relatedPlaylists", {}).get("uploads"),
                    })
            found.sort(key=lambda c: -c["subs"])
            chans = [c for c in found if c["uploads"]][:PER_LANGUAGE]
            result["channels"][lang] = [{k: c[k] for k in ("id", "title", "subs")} for c in chans]
            print(f"{lang}: " + ", ".join(f"{c['title']} ({c['subs']:,})" for c in chans), flush=True)

            catalog = []
            for c in chans:
                token = None
                for _ in range(PAGES):
                    params = {"part": "snippet", "playlistId": c["uploads"], "maxResults": 50}
                    if token:
                        params["pageToken"] = token
                    page = call("playlistItems", **params)
                    for it in page.get("items", []):
                        sn = it.get("snippet", {})
                        vid = sn.get("resourceId", {}).get("videoId")
                        if vid and sn.get("title") not in ("Private video", "Deleted video"):
                            catalog.append({"videoId": vid, "title": sn["title"], "channel": c["title"], "words": words(sn["title"])})
                    token = page.get("nextPageToken")
                    if not token:
                        break
            print(f"  {len(catalog)} uploads scanned", flush=True)

            # Grammar topics without a video yet.
            for t in (t for t in inp["topics"] if t["language"] == lang and not (already.get(t["id"]) or {}).get("videoId")):
                tw = words(t["title"])
                hints = LEVEL_HINTS[t["level"]]
                best, best_score = None, 0.0
                for v in catalog:
                    overlap = len(tw & v["words"])
                    if overlap < min(2, len(tw)):
                        continue
                    low = v["title"].lower()
                    score = overlap / max(len(tw), 1) + (0.3 if "grammar" in low else 0) + (0.2 if any(h in low for h in hints) else 0)
                    if score > best_score:
                        best, best_score = v, score
                if best and best_score >= 0.6:
                    result["topics"][t["id"]] = {"videoId": best["videoId"], "title": best["title"][:200], "channel": best["channel"]}

            # Unit themes: several matching videos so lessons can differ.
            result["themes"][lang] = {}
            generic = [v for v in catalog if "grammar" in v["title"].lower() or "learn" in v["title"].lower()]
            for th in inp["themes"]:
                keys = words(th["title"]) | {w for kw in th["words"] for w in words(kw)}
                picks = [v for v in catalog if keys & v["words"]] if keys else generic
                result["themes"][lang][th["id"]] = [{"videoId": v["videoId"], "title": v["title"][:200], "channel": v["channel"]} for v in picks[:30]]
    except QuotaExceeded:
        print("Daily quota reached; keeping what was collected.", flush=True)

    # Keep only public, embeddable, not age-restricted videos of 1–30 minutes.
    ids = {v["videoId"] for v in result["topics"].values()}
    for lang in result["themes"].values():
        for lst in lang.values():
            ids.update(v["videoId"] for v in lst)
    ok = set()
    ids = sorted(ids)
    try:
        for i in range(0, len(ids), 50):
            info = call("videos", part="contentDetails,status", id=",".join(ids[i:i + 50]))
            for v in info.get("items", []):
                st, cd = v.get("status", {}), v.get("contentDetails", {})
                dur = seconds(cd.get("duration", ""))
                if st.get("embeddable") and st.get("privacyStatus") == "public" and 60 <= dur <= 1800 and cd.get("contentRating", {}).get("ytRating") != "ytAgeRestricted":
                    ok.add(v["id"])
    except QuotaExceeded:
        print("Quota reached while checking videos; unchecked ones are dropped.", flush=True)
    result["topics"] = {k: v for k, v in result["topics"].items() if v["videoId"] in ok}
    for lang in result["themes"]:
        for th in result["themes"][lang]:
            result["themes"][lang][th] = [v for v in result["themes"][lang][th] if v["videoId"] in ok][:THEME_VIDEOS]

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
        f.write("\n")
    n_theme = sum(len(l) for lang in result["themes"].values() for l in lang.values())
    print(f"Topics matched: {len(result['topics'])}; theme videos: {n_theme}; quota units used: {units_used}")


if __name__ == "__main__":
    main()
