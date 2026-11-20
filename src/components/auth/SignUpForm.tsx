"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { signUpInput } from "@/lib/validation";
import { authErrorMessage, Divider, FormError, GoogleButton, type AuthDict } from "./shared";

export function SignUpForm({ lang, t, or, googleEnabled }: { lang: string; t: AuthDict; or: string; googleEnabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpInput.safeParse({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0];
      setError(field === "name" ? t.errors.name : field === "email" ? t.errors.email : t.errors.weak);
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await authClient.signUp.email(parsed.data);
    if (error) {
      setError(authErrorMessage(t, error));
      setBusy(false);
      return;
    }
    router.replace(`/${lang}/onboarding`);
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
          authClient.signIn.social({ provider: "google", callbackURL: `/${lang}/dashboard`, newUserCallbackURL: `/${lang}/onboarding` });
        }}
      />
      <Divider label={or} />
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={error} />
        <div>
          <label htmlFor="name" className="label">{t.name}</label>
          <input id="name" name="name" required maxLength={80} autoComplete="name" className="input" />
        </div>
        <div>
          <label htmlFor="email" className="label">{t.email}</label>
          <input id="email" name="email" type="email" required autoComplete="email" dir="ltr" className="input text-start" />
        </div>
        <div>
          <label htmlFor="password" className="label">{t.password}</label>
          <input id="password" name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" dir="ltr" className="input text-start" aria-describedby="pw-hint" />
          <p id="pw-hint" className="mt-1 text-xs text-faint">{t.passwordHint}</p>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>{t.submitSignUp}</button>
      </form>
      <p className="text-center text-sm text-muted">
        {t.haveAccount}{" "}
        <Link href={`/${lang}/sign-in`} className="font-semibold text-brand hover:underline">{t.submitSignIn}</Link>
      </p>
    </div>
  );
}
