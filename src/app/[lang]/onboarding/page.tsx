import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/site/Header";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack, getProfile } from "@/lib/learner/repo";
import { cachedLanguages } from "@/lib/shared-cache";

export default async function OnboardingPage({ params }: PageProps<"/[lang]/onboarding">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-8 pb-28 sm:py-12">
        <Suspense fallback={<p className="text-center text-muted">{dict.common.loading}</p>}>
          <Gate lang={lang} dict={dict} />
        </Suspense>
      </main>
    </>
  );
}

async function Gate({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await requireUser(lang, `/${lang}/onboarding`);
  const [profile, active, langs] = await Promise.all([getProfile(db, user.id), getActiveTrack(db, user.id), cachedLanguages()]);
  if (profile?.onboardedAt && active) redirect(`/${lang}/dashboard`);
  return (
    <OnboardingWizard
      lang={lang}
      initialNative={profile?.nativeLanguage ?? null}
      languages={langs.map((l) => ({ code: l.code, name: lang === "ar" ? l.nameAr : l.nameEn, nativeName: l.nativeName, glyph: l.glyph, isTarget: l.isTarget }))}
      t={{ onboarding: dict.onboarding, goals: dict.goals, times: dict.times, levels: dict.levels, common: dict.common, errors: dict.errors, profile: dict.profile }}
    />
  );
}
