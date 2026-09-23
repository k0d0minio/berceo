import type { Metadata } from "next";
import Link from "next/link";

import { signIn } from "@/app/(auth)/actions";
import { AuthPage } from "@/components/auth/auth-page";
import { SignInForm } from "@/components/auth/sign-in-form";
import { common } from "@/content/common";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";
import { currentUser } from "@/lib/auth/current-user";
import { redirectIfSignedIn } from "@/lib/auth/guard";
import { safeReturnPath } from "@/lib/auth/routing";

const t = words(comptes);
const pages = words(common).pages;

export const metadata: Metadata = {
  title: t.meta.connexion,
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/*
 * Sign-in (B-05). The URL can carry a way back (`retour`, only a path inside
 * a space) and one notice from the page that sent the user here.
 */
export default async function ConnexionPage({ searchParams }: PageProps<"/connexion">) {
  const params = await searchParams;
  const retour = safeReturnPath(first(params.retour));
  await redirectIfSignedIn(retour);

  const who = await currentUser();
  const notice =
    who.status === "no-row" || first(params.erreur) === "compte"
      ? t.erreurs.compteIndisponible
      : first(params.lien) === "invalide"
        ? t.erreurs.lienInvalide
        : first(params.verifie)
          ? t.connexion.dejaVerifie
          : first(params.mdp)
            ? t.connexion.motDePasseChange
            : first(params.renvoye)
              ? t.connexion.renvoye
              : undefined;

  return (
    <AuthPage title={t.connexion.title}>
      <div className="flex flex-col gap-8">
        <SignInForm action={signIn.bind(null, retour)} notice={notice} />
        <p className="text-corps text-taupe">
          {t.connexion.pasDeCompte}{" "}
          <Link href={pages.inscriptionFamille.href} className="text-sauge underline">
            {pages.inscriptionFamille.label}
          </Link>
          {" · "}
          <Link href={pages.inscriptionProfessionnelle.href} className="text-sauge underline">
            {pages.inscriptionProfessionnelle.label}
          </Link>
        </p>
      </div>
    </AuthPage>
  );
}
