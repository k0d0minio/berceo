import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RatingScreen } from "@/components/avis/rating-screen";
import { SpaceShell } from "@/components/shell/space-shell";
import { avis } from "@/content/avis";
import { fill, words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import { professionalRatingPath } from "@/lib/avis/paths";
import { ratingTarget } from "@/lib/avis/ratings";
import { professionalBookingPath } from "@/lib/reservations/paths";

import { rateProfessionalAction } from "./actions";

const t = words(avis);

export const metadata: Metadata = {
  title: t.meta.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Laisser un avis » (avis-etoiles): the professional rates the family she came to (D-115: Accueil, Communication, Clarté des consignes, Respect du cadre).
 * Four criteria, one to five stars each, no text (D-18); once, while the garde
 * is terminée and inside the 14 days after its end (D-117); never on an
 * annulée garde (D-122). Another person's garde, like an unknown one, is not
 * found. The invitation e-mail links here.
 */
export default async function ProfessionalRatingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ merci?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await requireAccess(withQuery(professionalRatingPath(id), query));
  const target = await ratingTarget("professionnelle", user.id, id);
  if (!target) notFound();
  const { merci } = query;

  return (
    <SpaceShell user={user} title={fill(t.formulaire.titreProfessionnelle, { prenom: target.otherFirstName })}>
      <RatingScreen
        side="professionnelle"
        target={target}
        thanked={merci === "1"}
        action={rateProfessionalAction.bind(null, target.bookingId)}
        backHref={professionalBookingPath(target.bookingId)}
      />
    </SpaceShell>
  );
}
