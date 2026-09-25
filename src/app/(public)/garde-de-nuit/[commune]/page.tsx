import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NoResult } from "@/components/recherche/no-result";
import { TeaserCard } from "@/components/recherche/professional-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/vitrine/page-header";
import { VitrineSection } from "@/components/vitrine/section";
import { common } from "@/content/common";
import { fill, words } from "@/content/locale";
import { recherche } from "@/content/recherche";
import { communeName } from "@/lib/communes";
import { teasersServing } from "@/lib/recherche/professionals";
import { communeMeta, zoneNames } from "@/lib/recherche/rules";
import { communeOfSlug, COMMUNE_PAGES_PATH, publicProfessionalPath } from "@/lib/recherche/slugs";

import { pageMetadata } from "../../page-metadata";

const t = words(recherche).commune;
const a = words(recherche).aucune;
const c = words(common);

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ commune: string }> }): Promise<Metadata> {
  const { commune: slug } = await params;
  const ins = communeOfSlug(slug);
  const name = ins ? communeName(ins) : null;
  if (!ins || !name) return {};
  return pageMetadata(communeMeta(name), `${COMMUNE_PAGES_PATH}/${slug}`);
}

/*
 * One page per commune of the official list, served or not (D-127), all
 * indexable (D-128): the title, an introduction for the commune, the teaser
 * cards of the validated professionals who serve it in the search order
 * (D-123; no photo, no availability, D-126), or the no-result message with a
 * way to create an account; then the call to create a family account and the
 * links to the vitrine. An unknown slug is not found.
 */
export default async function CommunePage({ params }: { params: Promise<{ commune: string }> }) {
  const { commune: slug } = await params;
  const ins = communeOfSlug(slug);
  const name = ins ? communeName(ins) : null;
  if (!ins || !name) notFound();

  const teasers = await teasersServing(ins, new Date());
  const signUp = c.pages.inscriptionFamille.href;

  return (
    <>
      <PageHeader title={fill(t.titre, { commune: name })} intro={fill(t.intro, { commune: name })} />

      <VitrineSection tone="perle" title={fill(t.liste, { commune: name })}>
        <p className="max-w-2xl text-corps text-encre-taupe">{t.verification}</p>
        {teasers.length === 0 ? (
          <NoResult text={a.texteCommune} className="bg-blanc">
            <Button asChild variant="sauge">
              <Link href={signUp}>{t.ctaBouton}</Link>
            </Button>
          </NoResult>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teasers.map((teaser) => (
              <li key={teaser.id} className="min-w-0">
                <TeaserCard
                  href={publicProfessionalPath(teaser.firstName, teaser.id)}
                  firstName={teaser.firstName}
                  profession={teaser.profession}
                  zone={zoneNames(teaser.communes, [ins])}
                  note={teaser.note}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        )}
      </VitrineSection>

      <VitrineSection title={fill(t.ctaTitre, { commune: name })}>
        <p className="max-w-2xl text-corps text-encre-taupe">{t.ctaTexte}</p>
        <Button asChild variant="sauge" className="self-start">
          <Link href={signUp}>{t.ctaBouton}</Link>
        </Button>
        <nav aria-label={t.enSavoirPlus} className="flex flex-col gap-2">
          <p className="text-legende font-semibold text-encre-taupe">{t.enSavoirPlus}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {[c.pages.commentCaMarche, c.pages.tarifs].map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="text-corps text-encre-sauge underline underline-offset-4">
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </VitrineSection>
    </>
  );
}
