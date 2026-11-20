import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/site/Header";
import { AccountForm, AddTrackForm, TrackList } from "@/components/profile/ProfileForms";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getProfile, listLanguages, listTracks } from "@/lib/learner/repo";
import Link from "next/link";
import { isAdminEmail } from "@/lib/admin";

export default async function ProfilePage({ params }: PageProps<"/[lang]/profile">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-6 pb-28 sm:py-10">
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{dict.profile.title}</h1>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Profile lang={lang} dict={dict} />
        </Suspense>
      </main>
    </>
  );
}

async function Profile({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await requireUser(lang, `/${lang}/profile`);
  const [profile, tracks, langs] = await Promise.all([getProfile(db, user.id), listTracks(db, user.id), listLanguages(db)]);
  if (!profile?.onboardedAt || !tracks.length) redirect(`/${lang}/onboarding`);
  const languages = langs.map((l) => ({ code: l.code, name: lang === "ar" ? l.nameAr : l.nameEn, glyph: l.glyph, isTarget: l.isTarget }));
  const t = { profile: dict.profile, common: dict.common, errors: dict.errors, goals: dict.goals, levels: dict.levels, dashboard: dict.dashboard, auth: dict.auth };
  return (
    <div className="animate-fade-up space-y-6">
      {isAdminEmail(user.email) && (
        <Link href={`/${lang}/admin`} className="btn-ghost" data-testid="admin-link">{dict.admin.adminLink}</Link>
      )}
      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">{dict.profile.account}</h2>
        <AccountForm lang={lang} t={t} email={profile.email} name={profile.name} nativeLanguage={profile.nativeLanguage} languages={languages} />
      </section>
      <section id="tracks" className="card scroll-mt-20 p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">{dict.profile.tracks}</h2>
        <div className="space-y-4">
          <TrackList t={t} languages={languages} tracks={tracks.map((tr) => ({ id: tr.id, targetLanguage: tr.targetLanguage, goal: tr.goal, dailyMinutes: tr.dailyMinutes, selfLevel: tr.selfLevel, isActive: tr.isActive }))} />
          <AddTrackForm t={t} languages={languages} taken={tracks.map((tr) => tr.targetLanguage)} nativeLanguage={profile.nativeLanguage} />
        </div>
      </section>
    </div>
  );
}
