import type { Metadata } from "next";

import { signUp } from "@/app/(auth)/actions";
import { AuthPage } from "@/components/auth/auth-page";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";
import { redirectIfSignedIn } from "@/lib/auth/guard";

const t = words(comptes);

export const metadata: Metadata = {
  title: t.meta.inscriptionProfessionnelle.title,
  description: t.meta.inscriptionProfessionnelle.description,
};

export const dynamic = "force-dynamic";

/*
 * Professional sign-up (B-02): step 1 of D-21, the same short form. The
 * onboarding steps that follow are stub 4's.
 */
export default async function InscriptionProfessionnellePage() {
  await redirectIfSignedIn();

  return (
    <AuthPage
      eyebrow={t.inscription.professionnelle.etape}
      title={t.inscription.professionnelle.title}
      intro={[t.inscription.message, t.inscription.professionnelle.accroche]}
    >
      <SignUpForm action={signUp.bind(null, "professionnel")} />
    </AuthPage>
  );
}
