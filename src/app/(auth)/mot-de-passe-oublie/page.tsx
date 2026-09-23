import type { Metadata } from "next";

import { requestPasswordReset } from "@/app/(auth)/actions";
import { AuthPage } from "@/components/auth/auth-page";
import { ResetRequestForm } from "@/components/auth/password-forms";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";

const t = words(comptes);

export const metadata: Metadata = {
  title: t.meta.motDePasseOublie,
  robots: { index: false, follow: true },
};

/* The guide's "Mot de passe oublié": one field, one neutral confirmation. */
export default function MotDePasseOubliePage() {
  return (
    <AuthPage title={t.motDePasseOublie.title} intro={[t.motDePasseOublie.instruction]}>
      <ResetRequestForm action={requestPasswordReset} />
    </AuthPage>
  );
}
