import type { Metadata } from "next";
import Link from "next/link";

import { StarInput } from "@/components/avis/rating-form";
import { NoteDisplay } from "@/components/avis/stars";
import { ProchainesDisponibilites } from "@/components/disponibilites/prochaines-disponibilites";
import { NoResult } from "@/components/recherche/no-result";
import { ProfessionalCard, TeaserCard } from "@/components/recherche/professional-card";
import { PortalShell } from "@/components/shell/portal-shell";
import { SignOutDialog } from "@/components/shell/sign-out-dialog";
import { Button } from "@/components/ui/button";
import { avis } from "@/content/avis";
import { designSystem } from "@/content/design-system";
import { words } from "@/content/locale";
import { recherche } from "@/content/recherche";

const t = words(designSystem).portail;

/** Sample nights for the availability block; the words, not the dates, are the point. */
const SAMPLE_NIGHTS = ["2026-09-30", "2026-10-02", "2026-10-03", "2026-10-09", "2026-10-12"];

/** A sample zone for the search's cards: more than three communes, to show the count. */
const SAMPLE_ZONE = ["Ixelles", "Etterbeek", "Uccle", "Forest", "Auderghem"];

/*
 * The signed-in portal's shell, shown with sample navigation. It lives in its
 * own route group so the public header and footer stay off it. Internal
 * reference: never indexed, linked from nowhere. Below it, the blocks of the
 * signed-in pages that no page mounts yet: « Prochaines disponibilités »,
 * the stars of the ratings (avis-etoiles) in each of their states, and the
 * search's cards and its no-result block (recherche-et-fiches-publiques).
 */
export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  robots: { index: false, follow: false },
};

export default function PortalShellPage() {
  return (
    <PortalShell
      nav={t.nav}
      home="/design-system/portail"
      actions={<SignOutDialog />}
    >
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-h1 text-encre-sauge">{t.title}</h1>
        <p className="max-w-2xl text-intro">{t.text}</p>
      </div>
      <section className="mt-12 flex flex-col gap-4">
        <h2 className="font-display text-h2 text-encre-sauge">{t.disponibilites.title}</h2>
        <p className="max-w-2xl text-corps">{t.disponibilites.text}</p>
        <div className="grid max-w-4xl gap-6 md:grid-cols-2">
          <ProchainesDisponibilites nights={SAMPLE_NIGHTS} />
          <ProchainesDisponibilites nights={[]} />
        </div>
      </section>
      <section className="mt-12 flex flex-col gap-4">
        <h2 className="font-display text-h2 text-encre-sauge">{t.avis.title}</h2>
        <p className="max-w-2xl text-corps">{t.avis.text}</p>
        <div className="flex max-w-2xl flex-col gap-6 rounded-carte bg-perle px-6 py-6 md:px-8">
          <NoteDisplay note={{ note: 4.6, gardes: 12 }} />
          <NoteDisplay note={{ note: null, gardes: 0 }} />
          <StarInput name="exemple" label={words(avis).criteres.famille.ponctualite} />
        </div>
      </section>
      <section className="mt-12 flex flex-col gap-4">
        <h2 className="font-display text-h2 text-encre-sauge">{t.recherche.title}</h2>
        <p className="max-w-2xl text-corps">{t.recherche.text}</p>
        <div className="grid max-w-4xl gap-6 rounded-carte bg-perle px-6 py-6 md:grid-cols-2 md:px-8">
          <ProfessionalCard
            href="/design-system/portail"
            firstName={t.recherche.prenom}
            profession="sage_femme"
            zone={SAMPLE_ZONE}
            note={{ note: 4.8, gardes: 7 }}
            photoId={null}
            nights={SAMPLE_NIGHTS}
          />
          <TeaserCard
            href="/design-system/portail"
            firstName={t.recherche.prenom}
            profession="sage_femme"
            zone={SAMPLE_ZONE.slice(0, 2)}
            note={{ note: null, gardes: 0 }}
          />
        </div>
        <NoResult text={words(recherche).aucune.texte}>
          <Button asChild>
            <Link href="/design-system/portail">{words(recherche).aucune.publier}</Link>
          </Button>
        </NoResult>
      </section>
    </PortalShell>
  );
}
