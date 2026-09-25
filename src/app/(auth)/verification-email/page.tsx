import type { Metadata } from "next";

import { AuthPage } from "@/components/auth/auth-page";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";

const t = words(comptes);

export const metadata: Metadata = {
  title: t.meta.verification,
  robots: { index: false, follow: false },
};

/*
 * After a sign-up, new or not (D-34: an existing address lands here too, so
 * the form never reveals it). The e-mail's link goes to ./confirmer.
 */
export default function VerificationEmailPage() {
  return (
    <AuthPage title={t.verification.title} intro={[t.verification.texte]}>
      <p className="text-corps text-encre-taupe">{t.verification.aide}</p>
    </AuthPage>
  );
}
