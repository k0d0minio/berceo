import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionRequired } from "@/components/abonnements/subscription-required";
import { OursonIcon } from "@/components/berceo-icons";
import { MarkButton } from "@/components/favoris/mark-button";
import { ProfessionalCard, TeaserCard } from "@/components/recherche/professional-card";
import { SearchForm } from "@/components/recherche/search-form";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { CardField } from "@/components/ui/card-field";
import { EmptyState } from "@/components/ui/empty-state";
import { fill, words } from "@/content/locale";
import { recherche } from "@/content/recherche";
import { familyMay } from "@/lib/abonnements/rules";
import { isSubscribed } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import { communeName, findLocality, parseLocalityValue, type Locality } from "@/lib/communes";
import { NEW_REQUEST_PATH } from "@/lib/demandes/paths";
import { familyCommune } from "@/lib/famille/profile";
import { markedAmong } from "@/lib/favoris/favourites";
import { cardsServing } from "@/lib/recherche/professionals";
import { communesOfParams, resolveQuery, searchQuery, zoneNames } from "@/lib/recherche/rules";
import { publicProfessionalPath, SEARCH_PATH } from "@/lib/recherche/slugs";
import { professionalProfilePath } from "@/lib/reservations/paths";

import { markAction } from "../professionnelles/actions";

const t = words(recherche);

export const metadata: Metadata = {
  title: t.meta.recherche,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/*
 * « Trouver une professionnelle » (D-11): the guide's field, then the
 * validated professionals serving the communes it names, as the DA's cards in
 * the search order (D-123), or the no-result message and a way to publish
 * (D-124). The field posts `q`; a query that names communes is answered by a
 * redirect to `?commune=` (repeated for a postcode that covers several), so a
 * result list is a URL a family can reload. Opened bare, the page searches
 * her own commune when her profile has one. Without a subscription the page
 * stays open with the public teaser cards, each linking to the professional's
 * public page, under the invitation line (abonnements-acces). With one, each
 * card carries the mark « mes professionnelles » (favoris-marquer). The cards
 * are white on a sage zone, and no result is the taupe empty state (JAM-327).
 */
export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await requireAccess(withQuery(SEARCH_PATH, params));

  const q = first(params.q);
  let error: string | undefined;
  let typed: string | undefined;
  if (q !== undefined) {
    const resolved = resolveQuery(q);
    if (resolved.kind === "communes") {
      // What the field shows next: the picked locality, or the text as typed (it resolves again).
      const picked = parseLocalityValue(q);
      const shown = picked ? `lieu=${encodeURIComponent(q)}` : `saisie=${encodeURIComponent(q.trim())}`;
      redirect(`${SEARCH_PATH}?${searchQuery(resolved.ins)}&${shown}`);
    }
    if (resolved.kind === "inconnue") {
      error = t.recherche.inconnue;
      const at = q.indexOf("|");
      typed = at >= 0 ? q.slice(at + 1) : q;
    }
  }

  let communes = communesOfParams(params.commune);
  let defaultValue: Locality | null = parseLocalityValue(first(params.lieu) ?? "");
  if (typed === undefined && !defaultValue) typed = first(params.saisie)?.slice(0, 80);

  // Opened bare: her own commune, when her profile has one.
  if (q === undefined && communes.length === 0) {
    const own = await familyCommune(user.id);
    if (own) {
      communes = [own.ins];
      defaultValue = findLocality(own.postcode, own.locality);
    }
  }

  const now = new Date();
  const [cards, subscribed] = await Promise.all([
    communes.length > 0 ? cardsServing(communes, now) : Promise.resolve([]),
    isSubscribed(user.id, now),
  ]);
  const full = familyMay("profil", { subscribed });
  const mayMark = familyMay("favori", { subscribed });
  const marked = mayMark ? await markedAmong(user.id, cards.map((card) => card.id)) : new Set<string>();
  const names = communes.map((ins) => communeName(ins) ?? ins).join(", ");

  return (
    <SpaceShell user={user} title={t.recherche.titre}>
      <SearchForm defaultValue={defaultValue} defaultText={typed} error={error} />

      {communes.length > 0 ? (
        <section className="flex flex-col gap-4" aria-labelledby="resultats">
          <div className="flex flex-col gap-1">
            <h2 id="resultats" className="text-h3 font-bold text-sauge">
              {fill(t.recherche.resultatsPour, { communes: names })}
            </h2>
            {cards.length > 0 ? (
              <p className="text-legende text-taupe">
                {cards.length === 1
                  ? t.recherche.uneProfessionnelle
                  : fill(t.recherche.professionnelles, { n: String(cards.length) })}
              </p>
            ) : null}
          </div>

          {cards.length === 0 ? (
            <EmptyState icon={OursonIcon} text={t.aucune.texte}>
              <Button asChild variant="taupe">
                <Link href={NEW_REQUEST_PATH}>{t.aucune.publier}</Link>
              </Button>
            </EmptyState>
          ) : full ? (
            <CardField>
              <ul className="grid gap-6 md:grid-cols-2">
                {cards.map((card) => (
                  <li key={card.id} className="min-w-0">
                    <ProfessionalCard
                      href={professionalProfilePath(card.id)}
                      firstName={card.firstName}
                      profession={card.profession}
                      zone={zoneNames(card.communes, communes)}
                      reach={card}
                      note={card.note}
                      photoId={card.photoId}
                      nights={card.nights}
                      mark={
                        mayMark ? (
                          <MarkButton
                            compact
                            marked={marked.has(card.id)}
                            prenom={card.firstName}
                            onToggle={markAction.bind(null, card.id, !marked.has(card.id))}
                          />
                        ) : undefined
                      }
                      className="h-full"
                    />
                  </li>
                ))}
              </ul>
            </CardField>
          ) : (
            <>
              <SubscriptionRequired />
              <CardField>
                <ul className="grid gap-6 md:grid-cols-2">
                  {cards.map((card) => (
                    <li key={card.id} className="min-w-0">
                      <TeaserCard
                        href={publicProfessionalPath(card.firstName, card.id)}
                        firstName={card.firstName}
                        profession={card.profession}
                        zone={zoneNames(card.communes, communes)}
                        reach={card}
                        note={card.note}
                        className="h-full"
                      />
                    </li>
                  ))}
                </ul>
              </CardField>
            </>
          )}
        </section>
      ) : null}
    </SpaceShell>
  );
}
