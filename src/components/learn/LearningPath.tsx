import Link from "next/link";
import {
  Briefcase, BookOpen, Brain, CalendarClock, Check, CloudSun, Coins, Cpu, Flag, FlaskConical, Gamepad2, GitBranch, GraduationCap,
  Hand, Hash, Heart, HeartPulse, History, Home, Landmark, Lightbulb, MapPin, MessagesSquare, Newspaper, Palette, Plane, PlayCircle,
  Quote, Scale, Shuffle, ChevronDown, ShoppingBag, Smile, Sparkles, Sun, Trees, User, Users, Utensils, Video, Clock, type LucideIcon,
} from "lucide-react";
import type { CourseOutline, LessonOutline } from "@/lib/curriculum";
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

const ART = [
  "bg-gradient-to-br from-[#bfe0ff] to-[#f9e6b8]",
  "bg-gradient-to-br from-[#ffd9a8] to-[#ffe9c9]",
  "bg-gradient-to-br from-[#c7f0d8] to-[#e2f3ff]",
  "bg-gradient-to-br from-[#e3d4ff] to-[#ffe1ec]",
];
const THEME_FILES = new Set(Object.keys(THEME_ICONS));
function themeOf(unitId: string): string {
  const theme = unitId.split("-fu-")[1]?.replace(/-\d+$/, "");
  return theme && THEME_FILES.has(theme) ? theme : "mixed";
}

type Props = {
  lang: "ar" | "en";
  course: CourseOutline;
  progress: Map<string, number>;
  checkpoints: Map<string, number>;
  nextId: string | undefined;
  t: Dictionary["learn"];
  /** Unit to render expanded; other units render as compact links (keeps the page light). */
  openId?: string | null;
  /** Current level filter, preserved in unit links. */
  level?: string;
  /** When searching, every matching unit renders expanded (results are few). */
  searching?: boolean;
};

type Unit = CourseOutline["units"][number];

function UnitHead({ lang, unit, ui, done, t }: { lang: "ar" | "en"; unit: Unit; ui: number; done: number; t: Dictionary["learn"] }) {
  return (
    <>
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4">
        <span className="w-fit rounded-full bg-[#f6e3b0] px-3 py-0.5 text-sm font-bold text-[#5b4300]">{fmt(t.unitNumber, { n: ui + 1 })}</span>
        <span className="text-xl font-bold leading-snug">{unit.title[lang]}</span>
        {unit.topicTitle && <span className="text-xs font-semibold text-brand">{t.grammarTag}: {unit.topicTitle[lang]}</span>}
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted">{fmt(t.unitLessons, { a: done, b: unit.lessons.length })}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-[#f2c14e]" style={{ width: `${(done / unit.lessons.length) * 100}%` }} />
          </span>
        </span>
      </span>
      <span className={`relative w-[42%] shrink-0 overflow-hidden ${ART[ui % ART.length]}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Fluent 3D emoji (MIT) */}
        <img src={`/images/themes/${themeOf(unit.id)}.webp`} alt="" loading="lazy" className="absolute inset-0 m-auto size-24 drop-shadow-xl transition-transform group-open:scale-90 sm:size-28" />
        <span className="absolute inset-y-0 start-0 w-10 bg-gradient-to-l from-transparent to-[var(--surface)] rtl:bg-gradient-to-r" />
        <ChevronDown className="absolute bottom-3 end-3 size-8 rounded-full bg-white/90 p-1.5 text-[#121a33] shadow transition-transform group-open:rotate-180" aria-hidden />
      </span>
    </>
  );
}

function LessonRow({ lang, unit, lesson, li, ui, best, isNext, t }: { lang: "ar" | "en"; unit: Unit; lesson: LessonOutline; li: number; ui: number; best: number | undefined; isNext: boolean; t: Dictionary["learn"] }) {
  const theme = unit.id.split("-fu-")[1]?.replace(/-\d+$/, "") ?? "";
  const Icon = THEME_ICONS[theme] ?? BookOpen;
  const completed = best !== undefined;
  return (
    <li className="relative flex gap-4 pb-6">
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
}

/** The course as a path: connected lesson circles per unit, ending with a unit test. */
export function LearningPath({ lang, course, progress, checkpoints, nextId, t, openId, level, searching }: Props) {
  const fallbackOpen = course.units.find((u) => u.lessons.some((l) => l.id === nextId))?.id ?? course.units[0]?.id;
  const openUnit = openId && course.units.some((u) => u.id === openId) ? openId : fallbackOpen;
  const levelQs = level ? `&level=${encodeURIComponent(level)}` : "";
  return (
    <div className="space-y-4" data-testid="learning-path">
      {course.units.map((unit, ui) => {
        const done = unit.lessons.filter((l) => progress.has(l.id)).length;
        const cp = checkpoints.get(unit.id);
        const expanded = searching || unit.id === openUnit;
        if (!expanded) {
          // Collapsed units are links to the expanded view: the lessons render on
          // demand instead of all living in the page at once.
          return (
            <div key={unit.id} id={`unit-${unit.id}`} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card" data-testid={`unit-${unit.id}`}>
              <Link href={`/${lang}/learn?open=${encodeURIComponent(unit.id)}${levelQs}#unit-${unit.id}`} className="flex items-stretch overflow-hidden rounded-2xl bg-surface" scroll>
                <UnitHead lang={lang} unit={unit} ui={ui} done={done} t={t} />
              </Link>
            </div>
          );
        }
        return (
          <details key={unit.id} open id={`unit-${unit.id}`} className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-card [&>ol]:pt-4" data-testid={`unit-${unit.id}`}>
            <summary className="flex cursor-pointer list-none items-stretch overflow-hidden rounded-2xl bg-surface">
              <UnitHead lang={lang} unit={unit} ui={ui} done={done} t={t} />
            </summary>

            <ol className="px-4 pb-5 sm:px-6">
              {unit.lessons.map((lesson, li) => (
                <LessonRow key={lesson.id} lang={lang} unit={unit} lesson={lesson} li={li} ui={ui} best={progress.get(lesson.id)} isNext={lesson.id === nextId} t={t} />
              ))}
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
              <li className="mt-3"><Link href={`/${lang}/learn/certificate/${unit.id}`} className="btn-ghost w-full text-sm">{lang === "ar" ? "شهادة الوحدة وشروطها" : "Unit certificate and requirements"}</Link></li>
            </ol>
          </details>
        );
      })}
    </div>
  );
}
