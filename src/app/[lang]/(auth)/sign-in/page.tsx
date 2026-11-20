import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { serviceStatus } from "@/lib/services";

export default async function SignInPage({ params }: PageProps<"/[lang]/sign-in">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <AuthShell lang={lang} dict={dict} title={dict.auth.signInTitle} sub={dict.auth.signInSub}>
      <Suspense>
        <SignInForm lang={lang} t={dict.auth} or={dict.common.or} googleEnabled={serviceStatus().google} />
      </Suspense>
    </AuthShell>
  );
}
