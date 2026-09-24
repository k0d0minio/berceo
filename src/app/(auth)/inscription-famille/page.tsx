import type { Metadata } from "next";

import { signUp } from "@/app/(auth)/actions";
import { AuthPage } from "@/components/auth/auth-page";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";
import { redirectIfSignedIn } from "@/lib/auth/guard";

const t = words(comptes);

export const metadata: Metadata = {
  title: t.meta.inscriptionFamille.title,
  description: t.meta.inscriptionFamille.description,
};

export const dynamic = "force-dynamic";

/* Family sign-up (B-01): the guide's message and hook sentence, then the form. */
export default async function InscriptionFamillePage() {
  await redirectIfSignedIn();

  return (
    <AuthPage
      title={t.inscription.famille.title}
      intro={[t.inscription.message, t.inscription.famille.accroche]}
    >
      <SignUpForm action={signUp.bind(null, "parent")} />
    </AuthPage>
  );
}
