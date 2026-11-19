"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage, Divider, FormError, GoogleButton, safeNext, type AuthDict } from "./shared";

export function SignInForm({ lang, t, or, googleEnabled }: { lang: string; t: AuthDict; or: string; googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), lang) ?? `/${lang}/dashboard`;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email: String(fd.get("email")), password: String(fd.get("password")) });
    if (error) {
      setError(authErrorMessage(t, error));
      setBusy(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <GoogleButton
        enabled={googleEnabled}
        busy={busy}
        label={t.google}
        offLabel={t.googleOff}
        onClick={() => {
          setBusy(true);
          authClient.signIn.social({ provider: "google", callbackURL: next });
        }}
      />
      <Divider label={or} />
      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        <FormError message={error} />
        <div>
          <label htmlFor="email" className="label">{t.email}</label>
          <input id="email" name="email" type="email" required autoComplete="email" dir="ltr" className="input text-start" />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="label">{t.password}</label>
            <Link href={`/${lang}/forgot-password`} className="text-sm text-brand hover:underline">{t.forgot}</Link>
          </div>
          <input id="password" name="password" type="password" required autoComplete="current-password" dir="ltr" className="input text-start" />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>{t.submitSignIn}</button>
      </form>
      <p className="text-center text-sm text-muted">
        {t.noAccount}{" "}
        <Link href={`/${lang}/sign-up`} className="font-semibold text-brand hover:underline">{t.submitSignUp}</Link>
      </p>
    </div>
  );
}
