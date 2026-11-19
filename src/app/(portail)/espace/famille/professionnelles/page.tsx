import type { Metadata } from "next";
import Link from "next/link";

import { SubscriptionRequired } from "@/components/abonnements/subscription-required";
import { MarkButton } from "@/components/favoris/mark-button";
import { ProfessionalListCard } from "@/components/favoris/professional-list-card";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { favoris } from "@/content/favoris";
import { words } from "@/content/locale";
import { recherche } from "@/content/recherche";
import { familyMay } from "@/lib/abonnements/rules";
import { isSubscribed } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { markedProfiles } from "@/lib/favoris/favourites";
import { listedIds } from "@/lib/favoris/rules";
import { SEARCH_PATH } from "@/lib/recherche/slugs";
import { familyBookings } from "@/lib/reservations/bookings";
import { FAMILY_PROFESSIONALS_PATH } from "@/lib/reservations/paths";
import { listedProfiles, type ListedProfile } from "@/lib/reservations/profiles";

import { markAction } from "./actions";

const t = words(favoris);

export const metadata: Metadata = {
  title: t.nav,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Mes professionnelles » (favoris-liste, D-07): her marks first, then
 * the professionals of her past gardes, each once, as cards. The marks come
 * from `src/lib/favoris/`, the gardes from `familyBookings`, the order and
 * the dedupe from `listedIds`, the profiles from `listedProfiles`, which
 * leaves a deleted account out (D-136) and reads the rest, available or not.
 * With a subscription each card opens the full profile and the priority
 * request and carries the mark: « Retirer » on a favourite, « Ajouter » on a
 * past garde's professional. Without one the invitation line shows once and
 * the cards carry no button (abonnements-acces). Empty, the page sends her
 * to the search.
 */
export default async function MesProfessionnellesPage() {
  const user = await requireAccess(FAMILY_PROFESSIONALS_PATH);
  const now = new Date();
  const [marks, gardes, subscribed] = await Promise.all([
    markedProfiles(user.id),
    familyBookings(user.id),
    isSubscribed(user.id, now),
  ]);
  const ids = listedIds(
    marks,
    gardes.map(({ professional, garde, request }) => ({
      profileId: professional.profileId,
      status: garde.status,
      nightDate: request.nightDate,
      startTime: request.startTime,
      extraHours: request.extraHours,
    })),
    now,
  );
  const profiles = await listedProfiles([...ids.marked, ...ids.past]);
  const present = (list: string[]) => list.map((id) => profiles.get(id)).filter((p): p is ListedProfile => !!p);
  const marked = present(ids.marked);
  const past = present(ids.past);

  const open = familyMay("profil", { subscribed }) && familyMay("priorite", { subscribed });
  const mayMark = familyMay("favori", { subscribed });

  const block = (title: string, cards: ListedProfile[], isMarked: boolean) =>
    cards.length === 0 ? null : (
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-h2 text-sauge">{title}</h2>
        <ul className="grid max-w-4xl gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <li key={card.id} className="min-w-0">
              <ProfessionalListCard
                {...card}
                actions={open}
                mark={
                  mayMark && card.available ? (
                    <MarkButton
                      marked={isMarked}
                      prenom={card.firstName}
                      onToggle={markAction.bind(null, card.id, !isMarked)}
                    />
                  ) : undefined
                }
                className="h-full"
              />
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <SpaceShell user={user} title={t.nav}>
      <p className="max-w-2xl text-intro text-taupe">{t.liste.intro}</p>
      {open ? null : <SubscriptionRequired />}
      {marked.length === 0 && past.length === 0 ? (
        <div className="flex max-w-2xl flex-col items-start gap-4">
          <p className="text-corps text-taupe">{t.liste.vide}</p>
          <Button asChild>
            <Link href={SEARCH_PATH}>{words(recherche).nav}</Link>
          </Button>
        </div>
      ) : (
        <>
          {block(t.liste.ajoutees, marked, true)}
          {block(t.liste.passees, past, false)}
        </>
      )}
    </SpaceShell>
  );
}
