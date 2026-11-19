import Link from "next/link";

import {
  BiberonIcon,
  CoeursIcon,
  DocumentIcon,
  LuneIcon,
  MaisonIcon,
} from "@/components/berceo-icons";
import { BerceoWordmark } from "@/components/berceo-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StripedSection } from "@/components/ui/striped-section";
import { TranslucentBlock } from "@/components/ui/translucent-block";
import { Photo } from "@/components/vitrine/photo";
import { ReasonGrid } from "@/components/vitrine/reason-grid";
import { VitrineSection } from "@/components/vitrine/section";
import { StepList } from "@/components/vitrine/step-list";
import { accueil } from "@/content/accueil";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { photos } from "@/content/photos";
import { SIGN_IN_PATH } from "@/lib/auth/routing";
import { pageMetadata } from "./page-metadata";

const t = words(accueil);
const c = words(common);
const p = words(photos);

export const metadata = pageMetadata(t.meta, "/");

/**
 * The home page, to the DA's deck (JAM-327). The hero is slide 19: the
 * photograph across the page, the header lying on it (HeaderFrame), the white
 * logotype alone at its centre. Then the first block on the stripes, whose
 * title is the page's H1, and the way in for an existing account under it
 * (round 2, JAM-301). Then the block of slide 15, the translucent card of
 * slide 20 on a photograph, and the sections the deck does not show, built
 * from its components: the three steps, why Berceo, the professionals' band.
 */
export default function AccueilPage() {
  return (
    <>
      {/* Slide 19: the photograph and the logotype. The crop keeps the fist and the mouth in frame. */}
      <section className="relative isolate flex min-h-[28rem] w-full items-center justify-center overflow-hidden px-4 pt-24 pb-16 md:min-h-[36rem]">
        <Photo
          photo={p.bebeEndormi}
          preload
          sizes="100vw"
          className="absolute inset-0 -z-10 h-full rounded-none object-[30%_50%]"
        />
        <BerceoWordmark
          role="img"
          aria-label={t.hero.logo}
          className="w-56 text-blanc md:w-80"
        />
      </section>

      {/* Slide 19: the first block. Below md the title sets at 26 px so it keeps to three lines in the block. */}
      <StripedSection
        blockClassName="max-w-4xl"
        ornament={<CoeursIcon />}
      >
        <h1 className="font-display text-h2 text-balance max-md:text-[1.625rem]">
          {t.premier.title}
        </h1>
        <p className="max-w-2xl">{t.premier.text}</p>
        <Button asChild variant="taupe">
          <Link href={c.pages.inscriptionFamille.href}>{t.premier.bouton}</Link>
        </Button>
      </StripedSection>

      {/* The way in for an existing account, families and professionals alike (round 2, JAM-301; JAM-327, question 7). */}
      <div className="bg-blanc px-4 py-6 text-center md:px-8">
        <p className="text-corps">
          {t.premier.connexion.question}{" "}
          <Link
            href={SIGN_IN_PATH}
            className="rounded-md font-semibold text-sauge underline underline-offset-4"
          >
            {t.premier.connexion.lien}
          </Link>
        </p>
      </div>

      {/* Slide 15: the wide taupe block. */}
      <VitrineSection className="pt-6 md:pt-8">
        <Card tone="taupe" className="items-start gap-5 px-6 md:px-16 md:py-12">
          <h2 className="font-display text-h2 text-balance max-md:text-[1.625rem]">
            {t.gardiennesDeLaNuit.title}
          </h2>
          <p className="max-w-4xl">{t.gardiennesDeLaNuit.text}</p>
          <Button asChild variant="taupe">
            <Link href={c.pages.commentCaMarche.href}>
              {t.gardiennesDeLaNuit.bouton}
            </Link>
          </Button>
        </Card>
      </VitrineSection>

      {/* Slide 20: the translucent card on a photograph, with three functional icons. */}
      <section className="relative isolate w-full overflow-hidden">
        <Photo
          photo={p.mainsPieds}
          sizes="100vw"
          className="absolute inset-0 -z-10 h-full rounded-none"
        />
        <div className="mx-auto flex max-w-6xl justify-end px-4 py-16 md:px-8 md:py-28">
          <TranslucentBlock className="max-w-md gap-5">
            <h2 className="font-sans text-h3 font-bold tracking-wide text-balance uppercase">
              {t.dormir.title}
            </h2>
            <p>{t.dormir.text}</p>
            <div className="flex justify-around pt-2">
              <MaisonIcon className="size-10" />
              <LuneIcon className="size-10" />
              <BiberonIcon className="size-10" />
            </div>
          </TranslucentBlock>
        </div>
      </section>

      <VitrineSection title={t.etapes.title} tone="perle">
        <StepList
          steps={t.etapes.steps}
          icons={[DocumentIcon, CoeursIcon, LuneIcon]}
        />
        <ul className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <li>
            <Link
              href={c.pages.commentCaMarche.href}
              className="font-semibold text-sauge underline underline-offset-4"
            >
              {t.etapes.liens.commentCaMarche}
            </Link>
          </li>
          <li>
            <Link
              href={c.pages.tarifs.href}
              className="font-semibold text-sauge underline underline-offset-4"
            >
              {t.etapes.liens.tarifs}
            </Link>
          </li>
        </ul>
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
        {/* Below md this heading sets at 26 px: at 32 px its shortest two-line split needs 380 px, and a phone's block gives 318 (blocs-accueil D-20). */}
        <h2 className="font-display text-h2 text-balance max-md:text-[1.625rem]">
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
