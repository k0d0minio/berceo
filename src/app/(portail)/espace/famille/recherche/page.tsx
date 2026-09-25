import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { NoResult } from "@/components/recherche/no-result";
import { ProfessionalCard } from "@/components/recherche/professional-card";
import { SearchForm } from "@/components/recherche/search-form";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { fill, words } from "@/content/locale";
import { recherche } from "@/content/recherche";
import { requireAccess } from "@/lib/auth/guard";
import { communeName, findLocality, parseLocalityValue, type Locality } from "@/lib/communes";
import { NEW_REQUEST_PATH } from "@/lib/demandes/paths";
import { familyCommune } from "@/lib/famille/profile";
import { cardsServing } from "@/lib/recherche/professionals";
import { communesOfParams, resolveQuery, searchQuery, zoneNames } from "@/lib/recherche/rules";
import { SEARCH_PATH } from "@/lib/recherche/slugs";
import { professionalProfilePath } from "@/lib/reservations/paths";

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
 * her own commune when her profile has one.
 */
export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAccess(SEARCH_PATH);
  const params = await searchParams;

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

  const cards = communes.length > 0 ? await cardsServing(communes, new Date()) : [];
  const names = communes.map((ins) => communeName(ins) ?? ins).join(", ");

  return (
    <SpaceShell user={user} title={t.recherche.titre}>
      <SearchForm defaultValue={defaultValue} defaultText={typed} error={error} />

      {communes.length > 0 ? (
        <section className="flex flex-col gap-4" aria-labelledby="resultats">
          <div className="flex flex-col gap-1">
            <h2 id="resultats" className="font-display text-h3 text-encre-sauge">
              {fill(t.recherche.resultatsPour, { communes: names })}
            </h2>
            {cards.length > 0 ? (
              <p className="text-legende text-encre-taupe">
                {cards.length === 1
                  ? t.recherche.uneProfessionnelle
                  : fill(t.recherche.professionnelles, { n: String(cards.length) })}
              </p>
            ) : null}
          </div>

          {cards.length === 0 ? (
            <NoResult text={t.aucune.texte}>
              <Button asChild>
                <Link href={NEW_REQUEST_PATH}>{t.aucune.publier}</Link>
              </Button>
            </NoResult>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2">
              {cards.map((card) => (
                <li key={card.id} className="min-w-0">
                  <ProfessionalCard
                    href={professionalProfilePath(card.id)}
                    firstName={card.firstName}
                    profession={card.profession}
                    zone={zoneNames(card.communes, communes)}
                    note={card.note}
                    photoId={card.photoId}
                    nights={card.nights}
                    className="h-full"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </SpaceShell>
  );
}
