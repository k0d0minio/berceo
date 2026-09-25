import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RatingScreen } from "@/components/avis/rating-screen";
import { SpaceShell } from "@/components/shell/space-shell";
import { avis } from "@/content/avis";
import { fill, words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { familyRatingPath } from "@/lib/avis/paths";
import { ratingTarget } from "@/lib/avis/ratings";
import { familyBookingPath } from "@/lib/reservations/paths";

import { rateFamilyAction } from "./actions";

const t = words(avis);

export const metadata: Metadata = {
  title: t.meta.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Laisser un avis » (avis-etoiles): the family rates the professional who came (D-115: Ponctualité, Communication, Soin, Confiance).
 * Four criteria, one to five stars each, no text (D-18); once, while the garde
 * is terminée and inside the 14 days after its end (D-117); never on an
 * annulée garde (D-122). Another person's garde, like an unknown one, is not
 * found. The invitation e-mail links here.
 */
export default async function FamilyRatingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ merci?: string }>;
}) {
  const { id } = await params;
  const user = await requireAccess(familyRatingPath(id));
  const target = await ratingTarget("famille", user.id, id);
  if (!target) notFound();
  const { merci } = await searchParams;

  return (
    <SpaceShell user={user} title={fill(t.formulaire.titreFamille, { prenom: target.otherFirstName })}>
      <RatingScreen
        side="famille"
        target={target}
        thanked={merci === "1"}
        action={rateFamilyAction.bind(null, target.bookingId)}
        backHref={familyBookingPath(target.bookingId)}
      />
    </SpaceShell>
  );
}
