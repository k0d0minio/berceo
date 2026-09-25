import type { Metadata } from "next";

import { FormMessage } from "@/components/auth/field";
import { ProfileForm } from "@/components/famille/profile-form";
import { SpaceShell } from "@/components/shell/space-shell";
import { famille } from "@/content/famille";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { ownFamilyProfile } from "@/lib/famille/profile";

import { saveProfile } from "./actions";

const t = words(famille).profil;
const completer = words(famille).accueil.completer;

export const metadata: Metadata = {
  title: t.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The family's profile: her details, her commune and her private address.
 * `?completer=1` is where the request form sends her while no commune is saved.
 */
export default async function ProfilFamillePage({
  searchParams,
}: {
  searchParams: Promise<{ completer?: string }>;
}) {
  const user = await requireAccess(PROFILE_PATH);
  const profile = await ownFamilyProfile(user.id);
  const askToComplete = (await searchParams).completer === "1" && !profile?.locality;

  return (
    <SpaceShell user={user} title={t.titre}>
      {askToComplete ? (
        <FormMessage>
          <span className="font-semibold">{completer.titre}</span> {completer.texte}
        </FormMessage>
      ) : null}
      <p className="max-w-2xl text-intro text-encre-taupe">{t.intro}</p>
      <ProfileForm
        action={saveProfile}
        defaults={{
          prenom: user.firstName,
          nom: user.lastName,
          email: user.email,
          telephone: user.phone ?? "",
          locality: profile?.locality ?? null,
          rue: profile?.street ?? "",
          numero: profile?.houseNumber ?? "",
          boite: profile?.box ?? "",
          contexte: profile?.context ?? "",
        }}
      />
    </SpaceShell>
  );
}
