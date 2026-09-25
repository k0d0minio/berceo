import type { Metadata } from "next";
import Link from "next/link";

import { OwnNote } from "@/components/avis/stars";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { comptes } from "@/content/comptes";
import { demandes } from "@/content/demandes";
import { famille } from "@/content/famille";
import { words } from "@/content/locale";
import { recherche } from "@/content/recherche";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { noteOfUser } from "@/lib/avis/ratings";
import { FAMILY_REQUESTS_PATH, NEW_REQUEST_PATH, NEW_URGENT_REQUEST_PATH } from "@/lib/demandes/paths";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { familyCommune } from "@/lib/famille/profile";
import { SEARCH_PATH } from "@/lib/recherche/slugs";

const t = words(comptes);
const f = words(famille).accueil;
const d = words(demandes);

export const metadata: Metadata = {
  title: t.meta.espace,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * The parent's space. Until her commune is saved it asks her to complete her
 * profile. The two ways to publish (D-60) and her requests are one tap away.
 * Her own note and gardes count close the page (avis-etoiles, D-121).
 */
export default async function EspaceFamillePage() {
  const user = await requireAccess(SPACES.parent);
  const [commune, note] = await Promise.all([familyCommune(user.id), noteOfUser(user.id)]);

  return (
    <SpaceShell user={user}>
      {commune ? null : (
        <section className="flex max-w-2xl flex-col items-start gap-4 rounded-carte bg-perle px-6 py-6 md:px-8">
          <h2 className="font-display text-h3 text-encre-sauge">{f.completer.titre}</h2>
          <p className="text-corps text-encre-taupe">{f.completer.texte}</p>
          <Button asChild>
            <Link href={PROFILE_PATH}>{f.completer.lien}</Link>
          </Button>
        </section>
      )}
      <p className="max-w-2xl text-intro text-encre-taupe">{d.famille.accueil}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={NEW_REQUEST_PATH}>{d.boutons.publier}</Link>
        </Button>
        <Button asChild variant="raye">
          <Link href={NEW_URGENT_REQUEST_PATH}>{d.boutons.publierUrgente}</Link>
        </Button>
      </div>
      <Link
        href={SEARCH_PATH}
        className="w-fit rounded-md text-corps font-semibold text-encre-sauge underline underline-offset-4"
      >
        {words(recherche).nav}
      </Link>
      <Link
        href={FAMILY_REQUESTS_PATH}
        className="w-fit rounded-md text-corps font-semibold text-encre-sauge underline underline-offset-4"
      >
        {d.famille.titre}
      </Link>
      <OwnNote note={note} />
    </SpaceShell>
  );
}
