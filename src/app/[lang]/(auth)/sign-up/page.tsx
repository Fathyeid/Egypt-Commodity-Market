import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { serviceStatus } from "@/lib/services";

export default async function SignUpPage({ params }: PageProps<"/[lang]/sign-up">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <AuthShell lang={lang} dict={dict} title={dict.auth.signUpTitle} sub={dict.auth.signUpSub}>
      <SignUpForm lang={lang} t={dict.auth} or={dict.common.or} googleEnabled={serviceStatus().google} />
    </AuthShell>
  );
}
