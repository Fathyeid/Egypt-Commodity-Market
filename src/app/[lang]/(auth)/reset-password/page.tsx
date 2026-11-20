import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/PasswordForms";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export default async function ResetPage({ params }: PageProps<"/[lang]/reset-password">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <AuthShell lang={lang} dict={dict} title={dict.auth.resetTitle}>
      <Suspense>
        <ResetForm lang={lang} t={dict.auth} />
      </Suspense>
    </AuthShell>
  );
}
