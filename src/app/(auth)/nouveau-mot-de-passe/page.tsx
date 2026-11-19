import type { Metadata } from "next";
import Link from "next/link";

import { setNewPassword } from "@/app/(auth)/actions";
import { FormMessage } from "@/components/auth/field";
import { AuthPage } from "@/components/auth/auth-page";
import { NewPasswordForm } from "@/components/auth/password-forms";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";

const t = words(comptes);

export const metadata: Metadata = {
  title: t.meta.nouveauMotDePasse,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* Where the reset e-mail's link lands: the token rides in the URL. */
export default async function NouveauMotDePassePage({
  searchParams,
}: PageProps<"/nouveau-mot-de-passe">) {
  const token = (await searchParams).token;

  return (
    <AuthPage title={t.nouveauMotDePasse.title}>
      {typeof token === "string" && token !== "" ? (
        <NewPasswordForm action={setNewPassword.bind(null, token)} />
      ) : (
        <div className="flex flex-col gap-6">
          <FormMessage>{t.erreurs.lienInvalide}</FormMessage>
          <Link href="/mot-de-passe-oublie" className="self-start text-corps text-sauge underline">
            {t.connexion.oublie}
          </Link>
        </div>
      )}
    </AuthPage>
  );
}
