import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Briefcase, Presentation, Plane, BedDouble, Utensils, ShoppingBag, Stethoscope, Handshake, Phone, Coffee, MessagesSquare } from "lucide-react";
import { Header } from "@/components/site/Header";
import { WorkPractice } from "@/components/tutor/WorkPractice";
import { WORK_SCENARIO_IDS } from "@/lib/ai/work-scenarios";
import { StartConversationButton } from "@/components/tutor/StartConversationButton";
import { AiStatusBanner } from "@/components/tutor/AiStatusBanner";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack } from "@/lib/learner/repo";
import { listConversations } from "@/lib/learner/conversations";
import { PERSONAS, PERSONA_IDS, SCENARIOS, SCENARIO_IDS } from "@/lib/ai/catalog";
import { aiStatus } from "@/lib/ai/provider";
import { limits } from "@/lib/ai/limits";

const ICONS = { briefcase: Briefcase, presentation: Presentation, plane: Plane, bed: BedDouble, utensils: Utensils, "shopping-bag": ShoppingBag, stethoscope: Stethoscope, handshake: Handshake, phone: Phone, coffee: Coffee } as const;

export default async function TutorPage({ params }: PageProps<"/[lang]/tutor">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Hub lang={lang} dict={dict} />
        </Suspense>
      </main>
    </>
  );
}

async function Hub({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await requireUser(lang, `/${lang}/tutor`);
  const track = await getActiveTrack(db, user.id);
  if (!track) redirect(`/${lang}/onboarding`);
  const t = dict.ai;
  const disabled = aiStatus() === "not_configured";
  const recent = await listConversations(db, user.id, 6);
  const errors = t.errorsMap as Record<string, string>;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{t.tutorTitle}</h1>
        <p className="max-w-2xl text-muted">{t.tutorSub}</p>
        <AiStatusBanner t={t} />
        {!disabled && <p className="text-xs text-faint">{fmt(t.limitsNote, { n: limits().dailyMessagesPerUser })}</p>}
      </section>

      <Link href={`/${lang}/tutor/voice`} className="card block border-brand bg-brand-soft p-6" data-testid="voice-cta"><h2 className="text-2xl font-bold">{lang === "ar" ? "حصة محادثة صوتية كاملة" : "A complete voice conversation session"}</h2><p className="mt-2 text-muted">{lang === "ar" ? "اتكلم، اسمع رد شريكك، وخد تقريرك في نهاية الحصة." : "Speak, hear your partner, and get feedback at the end."}</p><span className="mt-3 inline-block font-semibold text-brand">{lang === "ar" ? "اختار حصتك ←" : "Choose your session →"}</span></Link>

      <WorkPractice lang={lang} startControls={{
        supplier_followup: <StartConversationButton lang={lang} kind="roleplay" id="supplier_followup" label={t.start} disabled={disabled} errors={errors} />,
        customer_update: <StartConversationButton lang={lang} kind="roleplay" id="customer_update" label={t.start} disabled={disabled} errors={errors} />,
        team_update: <StartConversationButton lang={lang} kind="roleplay" id="team_update" label={t.start} disabled={disabled} errors={errors} />,
      }} />

      <section>
        <h2 className="mb-3 font-semibold">{t.pickPersona}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONA_IDS.map((id) => (
            <article key={id} className="card p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand"><MessagesSquare className="size-5" aria-hidden /></span>
              <h3 className="mt-3 font-semibold">{PERSONAS[id].name[lang]}</h3>
              <p className="text-sm text-muted">{PERSONAS[id].desc[lang]}</p>
              <StartConversationButton lang={lang} kind="tutor" id={id} label={t.start} disabled={disabled} errors={errors} />
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">{t.roleplayTitle}</h2>
        <p className="mb-3 text-muted">{t.roleplaySub}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SCENARIO_IDS.filter((id) => !(WORK_SCENARIO_IDS as readonly string[]).includes(id)).map((id) => {
            const Icon = ICONS[SCENARIOS[id].icon as keyof typeof ICONS];
            return (
              <article key={id} className="card p-4">
                <Icon className="size-6 text-brand" aria-hidden />
                <h3 className="mt-2 font-semibold">{SCENARIOS[id].name[lang]}</h3>
                <StartConversationButton lang={lang} kind="roleplay" id={id} label={t.start} disabled={disabled} errors={errors} />
              </article>
            );
          })}
        </div>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">{t.recent}</h2>
          <ul className="space-y-2">
            {recent.map((c) => (
              <li key={c.id}>
                <Link href={`/${lang}/tutor/${c.id}`} className="card flex items-center justify-between gap-3 p-3 hover:bg-surface-2">
                  <span className="font-semibold">
                    {c.kind === "tutor" ? PERSONAS[c.persona as keyof typeof PERSONAS]?.name[lang] : SCENARIOS[c.scenario as keyof typeof SCENARIOS]?.name[lang]}
                  </span>
                  <span className="text-sm text-brand">{c.status === "completed" ? t.report : t.continue}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
