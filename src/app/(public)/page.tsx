import Link from "next/link";
import { ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StripedSection } from "@/components/ui/striped-section";
import { CtaPair } from "@/components/vitrine/cta-pair";
import { Photo } from "@/components/vitrine/photo";
import { ReasonGrid } from "@/components/vitrine/reason-grid";
import { VitrineSection } from "@/components/vitrine/section";
import { StepList } from "@/components/vitrine/step-list";
import { accueil } from "@/content/accueil";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { photos } from "@/content/photos";
import { pageMetadata } from "./page-metadata";

const t = words(accueil);
const c = words(common);
const p = words(photos);

export const metadata = pageMetadata(t.meta, "/");

/**
 * The home page. Its H1 and the two doors sit above the fold on a phone; the
 * reassurance line follows them in the first screen (the guide's "premier
 * tiers"). Four H2 below: the family's three steps, who the professionals
 * are, why Berceo, and the professionals' band on the stripes.
 */
export default function AccueilPage() {
  return (
    <>
      {/* Stacked below lg; from lg the text takes all but the photo's 22rem, which keeps the 88-character H1 to 4 lines at 60 px (premier-ecran, D-6). Below 360 px, « professionnelles » needs 294 px even at the DA's 38 px floor, so the gutter narrows to 12 px there (operator, 2026-09-25). */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-8 pb-14 max-[22.5rem]:px-3 md:px-8 md:pt-14 md:pb-20 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <h1 className="font-display text-h1 text-balance text-encre-sauge max-[22.5rem]:text-[2.375rem]">
            {t.hero.title}
          </h1>
          <p className="max-w-xl text-intro">{t.hero.message}</p>
          {/* The message above names health professionals, so the family door may say "gardienne de la nuit" (D-25). */}
          <CtaPair
            family={{
              label: c.cta.trouverGardienne,
              href: c.pages.inscriptionFamille.href,
            }}
            professional={{
              label: c.cta.rejoindreReseau,
              href: c.pages.inscriptionProfessionnelle.href,
            }}
          />
          <p className="flex items-start gap-3 font-semibold text-encre-sauge">
            <ShieldCheckIcon aria-hidden className="mt-0.5 size-6 shrink-0" />
            {t.hero.reassurance}
          </p>
        </div>
        {/* The portrait crop keeps the fist and the mouth in frame. */}
        <Photo
          photo={p.bebeEndormi}
          preload
          fillHeight
          className="lg:object-[30%_50%]"
        />
      </section>

      <VitrineSection title={t.etapes.title} tone="perle">
        <StepList steps={t.etapes.steps} />
        <ul className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <li>
            <Link
              href={c.pages.commentCaMarche.href}
              className="font-semibold text-encre-sauge underline underline-offset-4"
            >
              {t.etapes.liens.commentCaMarche}
            </Link>
          </li>
          <li>
            <Link
              href={c.pages.tarifs.href}
              className="font-semibold text-encre-sauge underline underline-offset-4"
            >
              {t.etapes.liens.tarifs}
            </Link>
          </li>
        </ul>
      </VitrineSection>

      <VitrineSection
        title={t.gardiennes.title}
        className="md:grid md:grid-cols-2 md:items-center md:gap-12 md:[&>h2]:col-span-2"
      >
        <div className="flex flex-col gap-4">
          {/* Body size, not intro: beside the photo that is about 60 to 65 characters a line (blocs-accueil D-18). */}
          {t.gardiennes.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <Photo photo={p.mainDoigt} />
      </VitrineSection>

      <VitrineSection title={t.pourquoi.title} tone="sauge">
        <ReasonGrid items={t.pourquoi.reasons} />
        <Button asChild variant="sauge" className="self-start">
          <Link href={c.pages.inscriptionFamille.href}>
            {c.cta.trouverProfessionnelle}
          </Link>
        </Button>
      </VitrineSection>

      <StripedSection>
        <h2 className="font-display text-h2 text-balance">
          {t.professionnelles.title}
        </h2>
        <p>{t.professionnelles.text}</p>
        <Button asChild variant="taupe">
          <Link href={c.pages.inscriptionProfessionnelle.href}>
            {c.cta.rejoindreReseau}
          </Link>
        </Button>
      </StripedSection>
    </>
  );
}
