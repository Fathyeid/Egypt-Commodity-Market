"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage, FormError, type AuthDict } from "./shared";

export function ForgotForm({ lang, t, emailEnabled, isDev }: { lang: string; t: AuthDict; emailEnabled: boolean; isDev: boolean }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!emailEnabled && !isDev) {
    return <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm">{t.emailOff}</p>;
  }
  if (sent) return <p role="status" className="rounded-xl bg-brand-soft px-4 py-3 text-sm">{t.forgotSent}</p>;

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const email = String(new FormData(e.currentTarget).get("email"));
        setBusy(true);
        setError(null);
        const { error } = await authClient.requestPasswordReset({ email, redirectTo: `/${lang}/reset-password` });
        setBusy(false);
        if (error) setError(authErrorMessage(t, error));
        else setSent(true);
      }}
    >
      {!emailEnabled && <p className="rounded-xl bg-accent-soft px-4 py-2.5 text-xs">{t.emailOff} (dev: link printed to server console)</p>}
      <FormError message={error} />
      <div>
        <label htmlFor="email" className="label">{t.email}</label>
        <input id="email" name="email" type="email" required autoComplete="email" dir="ltr" className="input text-start" />
      </div>
      <button className="btn-primary w-full" disabled={busy}>{t.forgotSubmit}</button>
    </form>
  );
}

export function ResetForm({ lang, t }: { lang: string; t: AuthDict }) {
  const params = useSearchParams();
  const token = params.get("token");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") ? t.resetInvalid : null);
  const [busy, setBusy] = useState(false);

  if (done) {
    return (
      <div className="space-y-4">
        <p role="status" className="rounded-xl bg-brand-soft px-4 py-3 text-sm">{t.resetDone}</p>
        <Link href={`/${lang}/sign-in`} className="btn-primary w-full">{t.submitSignIn}</Link>
      </div>
    );
  }
  if (!token) return <FormError message={t.resetInvalid} />;

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const newPassword = String(new FormData(e.currentTarget).get("password"));
        if (newPassword.length < 8) return setError(t.errors.weak);
        setBusy(true);
        const { error } = await authClient.resetPassword({ newPassword, token });
        setBusy(false);
        if (error) setError(error.code === "INVALID_TOKEN" ? t.resetInvalid : authErrorMessage(t, error));
        else setDone(true);
      }}
    >
      <FormError message={error} />
      <div>
        <label htmlFor="password" className="label">{t.newPassword}</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className="input text-start" />
        <p className="mt-1 text-xs text-faint">{t.passwordHint}</p>
      </div>
      <button className="btn-primary w-full" disabled={busy}>{t.resetSubmit}</button>
    </form>
  );
}
