import type { Metadata } from "next";

import { signUp } from "@/app/(auth)/actions";
import { AuthPage } from "@/components/auth/auth-page";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";
import { redirectIfSignedIn } from "@/lib/auth/guard";
import { safeReturnPath, SIGN_IN_PATH, withReturn } from "@/lib/auth/routing";

const t = words(comptes);

export const metadata: Metadata = {
  title: t.meta.inscriptionFamille.title,
  description: t.meta.inscriptionFamille.description,
};

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/*
 * Family sign-up (B-01): the guide's message and hook sentence, then the form.
 * The URL can carry a way back (`retour`, only a path inside a space): a
 * signed-in visitor goes there at once, and a new family gets there after
 * confirming her e-mail in this browser (D-129).
 */
export default async function InscriptionFamillePage({ searchParams }: PageProps<"/inscription-famille">) {
  const retour = safeReturnPath(first((await searchParams).retour));
  await redirectIfSignedIn(retour);

  return (
    <AuthPage
      title={t.inscription.famille.title}
      intro={[t.inscription.message, t.inscription.famille.accroche]}
    >
      <SignUpForm action={signUp.bind(null, "parent", retour)} signInHref={withReturn(SIGN_IN_PATH, retour)} />
    </AuthPage>
  );
}
