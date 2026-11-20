import Link from "next/link";
import {
  Briefcase, BookOpen, Brain, CalendarClock, Check, CloudSun, Coins, Cpu, Flag, FlaskConical, Gamepad2, GitBranch, GraduationCap,
  Hand, Hash, Heart, HeartPulse, History, Home, Landmark, Lightbulb, MapPin, MessagesSquare, Newspaper, Palette, Plane, PlayCircle,
  Quote, Scale, Shuffle, ShoppingBag, Smile, Sparkles, Sun, Trees, User, Users, Utensils, Video, Clock, type LucideIcon,
} from "lucide-react";
import type { CourseOutline } from "@/lib/curriculum";
import type { Dictionary } from "@/lib/i18n";
import { fmt } from "@/lib/i18n/format";

const THEME_ICONS: Record<string, LucideIcon> = {
  greetings: Hand, family: Users, food: Utensils, home: Home, time: Clock, numbers: Hash, people: User, daily: Sun, places: MapPin,
  shopping: ShoppingBag, weather: CloudSun, travel: Plane, health: HeartPulse, hobbies: Gamepad2, school: GraduationCap, past: History,
  plans: CalendarClock, work: Briefcase, feelings: Smile, opinions: MessagesSquare, experience: Sparkles, technology: Cpu, nature: Trees,
  relationships: Heart, society: Landmark, media: Newspaper, conditions: GitBranch, money: Coins, science: FlaskConical, culture: Palette,
  abstract: Lightbulb, argument: Scale, idioms: Quote, philosophy: Brain, mixed: Shuffle,
};
const TONES = ["bg-brand-soft text-brand", "bg-accent-soft text-accent", "bg-surface-2 text-text", "bg-danger-soft text-danger"];

function unitIcon(unitId: string): LucideIcon {
  const theme = unitId.split("-fu-")[1]?.replace(/-\d+$/, "");
  return (theme && THEME_ICONS[theme]) || BookOpen;
}

type Props = {
  lang: "ar" | "en";
  course: CourseOutline;
  progress: Map<string, number>;
  checkpoints: Map<string, number>;
  nextId: string | undefined;
  t: Dictionary["learn"];
};

/** The course as a path: connected lesson circles per unit, ending with a unit test. */
export function LearningPath({ lang, course, progress, checkpoints, nextId, t }: Props) {
  const openUnit = course.units.find((u) => u.lessons.some((l) => l.id === nextId))?.id ?? course.units[0]?.id;
  return (
    <div className="space-y-4" data-testid="learning-path">
      {course.units.map((unit, ui) => {
        const Icon = unitIcon(unit.id);
        const tone = TONES[ui % TONES.length];
        const done = unit.lessons.filter((l) => progress.has(l.id)).length;
        const cp = checkpoints.get(unit.id);
        return (
          <details key={unit.id} open={unit.id === openUnit} className="card group overflow-hidden" data-testid={`unit-${unit.id}`}>
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5">
              <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-faint">{fmt(t.unitNumber, { n: ui + 1 })}</span>
                <span className="block font-semibold">{unit.title[lang]}</span>
              </span>
              <span className="text-sm text-muted">{fmt(t.unitProgress, { a: done, b: unit.lessons.length })}</span>
            </summary>

            <ol className="px-4 pb-5 sm:px-6">
              {unit.lessons.map((lesson, li) => {
                const best = progress.get(lesson.id);
                const completed = best !== undefined;
                const isNext = lesson.id === nextId;
                return (
                  <li key={lesson.id} className="relative flex gap-4 pb-6">
                    {/* connector to the next node */}
                    <span aria-hidden className={`absolute start-[31px] top-16 h-[calc(100%-4rem)] w-1 rounded-full ${completed ? "bg-ok" : "bg-line"}`} />
                    <Link href={`/${lang}/learn/${lesson.id}`} className="relative shrink-0" tabIndex={-1} aria-hidden>
                      <span
                        className={`grid size-16 place-items-center rounded-full border-4 ${
                          completed ? "border-ok" : isNext ? "border-brand shadow-[0_0_0_6px_var(--brand-soft)]" : "border-line"
                        } ${TONES[(ui + li) % TONES.length]}`}
                      >
                        <Icon className="size-7" />
                      </span>
                      {completed && (
                        <span className="absolute -bottom-1 start-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full border-2 border-surface bg-ok text-white rtl:translate-x-1/2">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </Link>
                    <Link
                      href={`/${lang}/learn/${lesson.id}`}
                      className={`min-w-0 flex-1 self-center rounded-xl p-2 transition-colors hover:bg-surface-2 ${isNext ? "bg-brand-soft/40" : ""}`}
                      data-testid={`lesson-${lesson.id}`}
                    >
                      <span className="flex flex-wrap items-center gap-1.5">
                        {lesson.hasVideo && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
                            <Video className="size-3" aria-hidden /> {t.videoTag}
                          </span>
                        )}
                        {lesson.topicId && (
                          <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-brand-ink">{t.grammarTag}</span>
                        )}
                      </span>
                      <span className="mt-1 block text-lg font-semibold leading-snug">{lesson.title[lang]}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-sm">
                        {completed ? (
                          <span className="font-semibold text-ok">{fmt(t.best, { n: best })}</span>
                        ) : isNext ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-brand"><PlayCircle className="size-4" aria-hidden /> {t.start}</span>
                        ) : (
                          <span className="line-clamp-1 text-muted">{lesson.goal[lang]}</span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href={`/${lang}/learn/checkpoint/${unit.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent-soft p-4 transition-shadow hover:shadow-card"
                  data-testid={`checkpoint-${unit.id}`}
                >
                  <span className={`grid size-16 shrink-0 place-items-center rounded-full border-4 ${cp !== undefined && cp >= 70 ? "border-ok" : "border-accent"} bg-surface text-accent`}>
                    <Flag className="size-7" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold">{t.checkpointTitle}</span>
                    <span className="block text-sm text-muted">{cp !== undefined ? fmt(t.checkpointBest, { n: cp }) : t.checkpointBody}</span>
                  </span>
                </Link>
              </li>
            </ol>
          </details>
        );
      })}
    </div>
  );
}
