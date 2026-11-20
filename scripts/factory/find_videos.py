#!/usr/bin/env python3
"""
Finds one YouTube video per grammar topic with the YouTube Data API v3 and stores
the choice in data/videos.json. Runs on GitHub Actions with the YOUTUBE_API_KEY secret.

- Level by level (A1 first, all languages), skipping topics already chosen.
- Stays inside the free daily quota (a search costs 100 units of 10,000), and stops
  cleanly when the quota runs out; the next daily run continues where it stopped.
- Only public, embeddable, safe-search videos of 2–30 minutes; the most-watched wins.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

API = os.environ.get("YOUTUBE_API_BASE", "https://www.googleapis.com/youtube/v3")
KEY = os.environ.get("YOUTUBE_API_KEY", "")
MAX_SEARCHES = int(os.environ.get("MAX_SEARCHES", "90"))
LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
# Most-learned languages first within each level.
PRIORITY = ["en", "de", "fr", "es", "it", "pt", "tr", "ru", "zh", "ja", "ko", "ar"]


class QuotaExceeded(Exception):
    pass


def call(endpoint: str, **params) -> dict:
    params["key"] = KEY
    url = f"{API}/{endpoint}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "lisan-video-finder"}), timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        if e.code == 403 and ("quota" in body.lower() or "rateLimit" in body):
            raise QuotaExceeded() from e
        sys.exit(f"YouTube API error {e.code}: {body[:500]}")


def seconds(iso: str) -> int:
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m:
        return 0
    d, h, mi, s = (int(x) if x else 0 for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + s


def query_for(t: dict) -> str:
    # Arabic is searched as a lesson for learners of Arabic; others as grammar lessons.
    return f"{t['languageName']} grammar {t['title']} {t['level']} lesson"


def main() -> None:
    if not KEY:
        sys.exit("YOUTUBE_API_KEY is not set")
    topics_file, videos_file = sys.argv[1], sys.argv[2]
    topics = json.load(open(topics_file, encoding="utf-8"))
    videos = json.load(open(videos_file, encoding="utf-8")) if os.path.exists(videos_file) else {}
    todo = sorted((t for t in topics if t["id"] not in videos), key=lambda t: (LEVELS.index(t["level"]), PRIORITY.index(t["language"]) if t["language"] in PRIORITY else 99, t["id"]))
    print(f"{len(videos)} topics already have a video; {len(todo)} to go; budget {MAX_SEARCHES} searches")

    done = 0
    try:
        for t in todo[:MAX_SEARCHES]:
            q = query_for(t)
            res = call("search", part="snippet", type="video", q=q, maxResults=8, videoEmbeddable="true", safeSearch="strict")
            ids = [i["id"]["videoId"] for i in res.get("items", []) if i.get("id", {}).get("videoId")]
            best = None
            if ids:
                info = call("videos", part="snippet,contentDetails,statistics,status", id=",".join(ids))
                for v in info.get("items", []):
                    st, cd = v.get("status", {}), v.get("contentDetails", {})
                    dur = seconds(cd.get("duration", ""))
                    if not st.get("embeddable") or st.get("privacyStatus") != "public" or not (120 <= dur <= 1800):
                        continue
                    if cd.get("contentRating", {}).get("ytRating") == "ytAgeRestricted":
                        continue
                    views = int(v.get("statistics", {}).get("viewCount", 0))
                    if best is None or views > best["views"]:
                        best = {"videoId": v["id"], "title": v["snippet"]["title"][:200], "channel": v["snippet"]["channelTitle"][:120], "views": views, "seconds": dur}
            videos[t["id"]] = best or {"videoId": None}
            if best:
                videos[t["id"]].update(query=q, foundAt=datetime.now(timezone.utc).date().isoformat())
            done += 1
            print(f"{t['id']}: {best['title'] if best else 'no suitable video'}")
    except QuotaExceeded:
        print("Daily quota reached; the next run continues.")

    with open(videos_file, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(videos.items())), f, ensure_ascii=False, indent=1)
        f.write("\n")
    found = sum(1 for v in videos.values() if v.get("videoId"))
    print(f"Searched {done} topics this run. {found} topics have a video, {len(topics) - len(videos)} remain.")


if __name__ == "__main__":
    main()
