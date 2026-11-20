import type { TopicInfo } from "@/lib/curriculum";
import { Bidi } from "@/components/ui/Bidi";

/** Topic explanation + approved YouTube video (privacy-enhanced embed). */
export function TopicPanel({ topic, lang, label }: { topic: TopicInfo; lang: "ar" | "en"; label: string }) {
  return (
    <section className="card mx-auto mb-5 max-w-3xl space-y-3 p-4 sm:p-5" data-testid="topic-panel">
      <h2 className="font-semibold">{topic.title[lang]}</h2>
      {topic.videoId && (
        <div className="aspect-video overflow-hidden rounded-xl bg-surface-2">
          <iframe
            className="size-full"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(topic.videoId)}`}
            title={topic.videoTitle ?? label}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
      {topic.explanation && (
        <ol className="space-y-2" data-testid="topic-points">
          {splitPoints(topic.explanation[lang]).map((point, n) => (
            <li key={n} className="flex gap-3 rounded-xl bg-surface-2 p-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-brand-ink">{n + 1}</span>
              <span dir="auto" className="self-center leading-relaxed"><Bidi text={point} /></span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** Splits an explanation into numbered points (one sentence each), keeping examples attached. */
export function splitPoints(text: string): string[] {
  return text
    .split(/(?<=[.!?؟])\s+(?=[^\s])/u)
    .map((p) => p.trim())
    .filter(Boolean);
}
