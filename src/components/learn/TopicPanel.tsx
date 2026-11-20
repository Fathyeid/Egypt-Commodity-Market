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
      {topic.explanation && <p dir="auto" className="leading-relaxed"><Bidi text={topic.explanation[lang]} /></p>}
    </section>
  );
}
