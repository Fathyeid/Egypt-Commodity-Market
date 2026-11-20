import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/PasswordForms";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { serviceStatus } from "@/lib/services";

export default async function ForgotPage({ params }: PageProps<"/[lang]/forgot-password">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <AuthShell lang={lang} dict={dict} title={dict.auth.forgotTitle} sub={dict.auth.forgotSub}>
      <ForgotForm lang={lang} t={dict.auth} emailEnabled={serviceStatus().email} isDev={process.env.NODE_ENV !== "production"} />
    </AuthShell>
  );
}
