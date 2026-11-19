import type { Metadata } from "next";
import type { ReactNode } from "react";

import { NoteDisplay } from "@/components/avis/stars";
import {
  berceoIcons,
  BiberonIcon,
  CoeursIcon,
  LieuIcon,
  LuneIcon,
  MaisonIcon,
  MobileIcon,
  OursonIcon,
} from "@/components/berceo-icons";
import { BerceoLogomark, BerceoWordmark } from "@/components/berceo-logo";
import { RequestCard } from "@/components/demandes/request-card";
import {
  CheckIcon,
  FileTextIcon,
  HeartIcon,
  MenuIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@/components/icons";
import { TeaserCard } from "@/components/recherche/professional-card";
import { SignOutDialog } from "@/components/shell/sign-out-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
import { Input } from "@/components/ui/input";
import { StripedSection } from "@/components/ui/striped-section";
import { TranslucentBlock } from "@/components/ui/translucent-block";
import { PageHeader } from "@/components/vitrine/page-header";
import { Photo } from "@/components/vitrine/photo";
import { PlaceholderPage } from "@/components/vitrine/placeholder-page";
import { TestimonialRow } from "@/components/vitrine/testimonial-card";
import { accueil } from "@/content/accueil";
import { common } from "@/content/common";
import { designSystem } from "@/content/design-system";
import { fill, words } from "@/content/locale";
import { photos } from "@/content/photos";
import { quiSommesNous } from "@/content/qui-sommes-nous";
import { cn } from "@/lib/utils";

const t = words(designSystem);
const c = words(common);
const home = words(accueil);
const story = words(quiSommesNous);
const p = words(photos);
const e = t.ecrans;

/* The deck's sample request of slide 25: one night in Bruxelles, a baby of three months. */
const sampleRequest = {
  id: "exemple",
  urgent: false,
  nightDate: "2026-09-30",
  startTime: "20:00",
  extraHours: 0,
  children: "un_bebe",
  babyAgeValue: 3,
  babyAgeUnit: "mois",
  feeding: null,
  communeIns: "21004",
  postcode: "1000",
  locality: "Bruxelles",
  createdAt: new Date("2026-09-01T10:00:00Z"),
} as const;

/** One specimen of the deck: the slide's number, what it shows, then the component. */
function Slide({ n, legend, children }: { n: string; legend: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-legende">
        <span className="font-semibold">{fill(e.diapositive, { n })}</span> · {legend}
      </p>
      <div className="overflow-hidden rounded-carte">{children}</div>
    </div>
  );
}

/* Internal reference: never indexed, linked from nowhere. */
export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  robots: { index: false, follow: false },
};

/* Tailwind reads class names from source, so each token's classes are written out. */
const swatchClass: Record<string, string> = {
  blanc: "bg-blanc border border-perle",
  sauge: "bg-sauge",
  raye: "motif-raye",
  taupe: "bg-taupe",
  perle: "bg-perle",
  beurre: "bg-beurre",
  "rouge-confirmation": "bg-rouge-confirmation",
  "vert-confirmation": "bg-vert-confirmation",
};

const levelClass: Record<string, string> = {
  h1: "font-display text-h1 text-sauge",
  h2: "font-display text-h2 text-sauge",
  nav: "font-display text-nav text-sauge",
  h3: "font-sans text-h3 font-bold",
  intro: "text-intro",
  corps: "text-corps",
  bouton: "text-bouton font-semibold",
  champ: "text-champ",
  legende: "text-legende",
};

/* The four backgrounds of the DA's button table, and each one's hover state held on. */
const backgrounds = [
  {
    variant: "blanc",
    band: "bg-blanc border border-perle",
    hover: "border-sauge bg-sauge text-blanc [transform:scale(1.03)]",
  },
  {
    variant: "raye",
    band: "motif-raye",
    hover: "border-beurre bg-beurre text-taupe [transform:scale(1.03)]",
  },
  {
    variant: "sauge",
    band: "bg-sauge",
    hover: "border-beurre bg-beurre text-sauge [transform:scale(1.03)]",
  },
  {
    variant: "taupe",
    band: "bg-taupe",
    hover: "border-beurre bg-beurre text-taupe [transform:scale(1.03)]",
  },
  {
    /* The founders' « refuser » (JAM-300). */
    variant: "rouge",
    band: "bg-blanc border border-perle",
    hover: "[transform:scale(1.03)]",
  },
] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:px-8 md:py-16">
      <h2 className="font-display text-h2 text-sauge">{title}</h2>
      {children}
    </section>
  );
}

/** The banner of slide 10, with an H3 in place of the page's H1 so this page keeps one H1. */
function PageHeaderSpecimen() {
  return <PageHeader title={e.bandeau.title} titleLevel={3} ornaments={[OursonIcon, MobileIcon]} />;
}

export default function DesignSystemPage() {
  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-12 md:px-8 md:pt-20">
        <h1 className="font-display text-h1 text-sauge">{t.meta.title}</h1>
        <p className="max-w-2xl text-intro">{t.intro}</p>
      </div>

      <Section title={t.palette.title}>
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {t.palette.swatches.map((swatch) => (
            <li key={swatch.token} className="flex flex-col gap-3">
              <div
                aria-hidden
                className={cn("h-28 rounded-carte", swatchClass[swatch.token])}
              />
              <div>
                <p className="font-bold">{swatch.name}</p>
                <p className="text-legende">
                  {swatch.share ? `${swatch.role} · ${swatch.share}` : swatch.role}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.type.title}>
        <dl className="flex flex-col gap-8">
          {t.type.levels.map((level) => (
            <div
              key={level.level}
              className="grid gap-2 border-b pb-6 md:grid-cols-[12rem_1fr] md:items-baseline"
            >
              <dt className="text-legende">{level.name}</dt>
              <dd className={levelClass[level.level]}>{level.sample}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title={t.buttons.title}>
        <div className="flex flex-col gap-8">
          {backgrounds.map((bg) => (
            <div key={bg.variant} className="flex flex-col gap-3">
              <p className="text-legende">{t.buttons.backgrounds[bg.variant]}</p>
              <div
                className={cn(
                  "flex flex-wrap items-center gap-6 rounded-carte p-8",
                  bg.band,
                )}
              >
                <Button variant={bg.variant}>{t.buttons.sample}</Button>
                <Button variant={bg.variant} className={bg.hover} tabIndex={-1}>
                  {t.buttons.sample}
                </Button>
              </div>
              <p className="flex gap-6 text-legende">
                <span>{t.buttons.states.default}</span>
                <span aria-hidden>·</span>
                <span>{t.buttons.states.hover}</span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t.cards.title}>
        <div className="grid gap-6 md:grid-cols-3">
          {(
            [
              { label: t.cards.onBlanc, band: "bg-blanc border border-perle", tone: "sauge", button: "sauge" },
              { label: t.cards.onSauge, band: "bg-sauge", tone: "blanc", button: "blanc" },
              { label: t.cards.onPerle, band: "bg-perle", tone: "blanc", button: "blanc" },
            ] as const
          ).map((example) => (
            <div key={example.label} className="flex flex-col gap-3">
              <p className="text-legende">{example.label}</p>
              <div className={cn("rounded-carte p-4 md:p-6", example.band)}>
                <Card tone={example.tone}>
                  <CardHeader>
                    <CardTitle>{t.cards.cardTitle}</CardTitle>
                    <CardDescription>{t.cards.cardCaption}</CardDescription>
                  </CardHeader>
                  <CardContent>{t.cards.cardText}</CardContent>
                  <CardFooter>
                    <Button variant={example.button}>
                      {c.cta.trouverProfessionnelle}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="mx-auto max-w-6xl px-4 pt-12 md:px-8 md:pt-16">
        <h2 className="font-display text-h2 text-sauge">{t.striped.title}</h2>
      </div>
      <div className="py-8">
        <StripedSection>
          <h3 className="font-display text-h2">{t.striped.blockTitle}</h3>
          <p className="text-intro">{c.professionnelles}</p>
          {/* D-25: the text above names the professionals, so this CTA may say "gardienne". */}
          <Button variant="taupe">{c.cta.trouverGardienne}</Button>
        </StripedSection>
      </div>

      <Section title={t.translucent.title}>
        <div className="rounded-carte bg-sauge p-6 md:p-16">
          <TranslucentBlock className="mx-auto max-w-md">
            <h3 className="font-sans text-h3 font-bold">
              {t.translucent.blockTitle}
            </h3>
            <label className="flex flex-col gap-2">
              <span className="text-legende">{t.translucent.fieldLabel}</span>
              <Input placeholder={t.translucent.fieldPlaceholder} />
            </label>
            <Button>{c.cta.trouverProfessionnelle}</Button>
          </TranslucentBlock>
        </div>
      </Section>

      <Section title={t.icons.title}>
        <p className="max-w-2xl text-corps">{t.icons.text}</p>
        <div className="flex flex-wrap items-end gap-8 text-sauge">
          <MenuIcon aria-hidden className="size-6" />
          <CheckIcon aria-hidden className="size-6" />
          <HeartIcon aria-hidden className="size-8" />
          <FileTextIcon aria-hidden className="size-8" />
          <ShieldCheckIcon aria-hidden className="size-14" />
        </div>
      </Section>

      <Section title={t.dialog.title}>
        <p className="text-corps">{t.dialog.hint}</p>
        <div>
          <SignOutDialog />
        </div>
      </Section>

      {/* The deck's screens, one specimen for each slide (JAM-327). */}
      <Section title={e.title}>
        <p className="max-w-2xl text-corps">{e.text}</p>

        <Slide n="8" legend={e.legendes.icones}>
          <ul className="grid grid-cols-3 gap-6 bg-sauge p-8 text-blanc sm:grid-cols-6">
            {berceoIcons.map(([name, Icon]) => (
              <li key={name} className="flex justify-center">
                <Icon className="size-14" />
              </li>
            ))}
          </ul>
        </Slide>

        <Slide n="19" legend={e.legendes.accueil}>
          <div className="relative isolate flex min-h-80 items-center justify-center overflow-hidden px-4 py-20">
            <Photo
              photo={p.bebeEndormi}
              sizes="100vw"
              className="absolute inset-0 -z-10 h-full rounded-none object-[30%_50%]"
            />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-6 py-4 text-blanc">
              <BerceoLogomark className="h-10 w-auto" />
              <ul className="hidden gap-8 font-display text-nav md:flex">
                {[c.nav.accueil, c.nav.histoire, c.nav.gardesDeNuit, c.nav.contact].map((link) => (
                  <li key={link.href}>{link.label}</li>
                ))}
              </ul>
              <UserIcon aria-hidden className="size-7" />
            </div>
            <BerceoWordmark aria-hidden className="w-56 text-blanc" />
          </div>
          <StripedSection blockClassName="max-w-4xl" ornament={<CoeursIcon />}>
            <h3 className="font-display text-h2 text-balance">{home.premier.title}</h3>
            <p className="max-w-2xl">{home.premier.text}</p>
            <Button variant="taupe">{home.premier.bouton}</Button>
          </StripedSection>
        </Slide>

        <Slide n="10" legend={e.legendes.bandeau}>
          <PageHeaderSpecimen />
          <div className="motif-raye px-3 py-12 md:px-4">
            <div className="relative mx-auto flex max-w-2xl flex-col items-end gap-4 rounded-carte bg-taupe p-6 text-right text-blanc md:p-12">
              <LuneIcon aria-hidden className="absolute top-6 left-6 size-14 text-beurre" />
              <h3 className="font-display text-h2">{e.bandeau.title}</h3>
              <p className="max-w-md">{e.bandeau.text}</p>
            </div>
          </div>
        </Slide>

        <Slide n="15" legend={e.legendes.blocTaupe}>
          <Card tone="taupe" className="items-start gap-5 px-6 md:px-16 md:py-12">
            <h3 className="font-display text-h2 text-balance">{home.gardiennesDeLaNuit.title}</h3>
            <p className="max-w-4xl">{home.gardiennesDeLaNuit.text}</p>
            <Button variant="taupe">{home.gardiennesDeLaNuit.bouton}</Button>
          </Card>
        </Slide>

        <Slide n="20" legend={e.legendes.carteTransparente}>
          <div className="relative isolate flex justify-end overflow-hidden px-4 py-16 md:px-12">
            <Photo
              photo={p.mainsPieds}
              sizes="100vw"
              className="absolute inset-0 -z-10 h-full rounded-none"
            />
            <TranslucentBlock className="max-w-md gap-5">
              <h3 className="font-sans text-h3 font-bold tracking-wide text-balance uppercase">
                {home.dormir.title}
              </h3>
              <p>{home.dormir.text}</p>
              <div className="flex justify-around pt-2">
                <MaisonIcon className="size-10" />
                <LuneIcon className="size-10" />
                <BiberonIcon className="size-10" />
              </div>
            </TranslucentBlock>
          </div>
        </Slide>

        <Slide n="21" legend={e.legendes.recherche}>
          <div className="grid gap-4 bg-blanc md:grid-cols-2">
            <div className="relative isolate flex items-center justify-center overflow-hidden rounded-carte px-4 py-16">
              <Photo
                photo={p.mainDoigt}
                className="absolute inset-0 -z-10 h-full rounded-none"
              />
              <TranslucentBlock className="max-w-xs items-center text-center">
                <h3 className="font-display text-nav">{e.recherche.titre}</h3>
                <p>{e.recherche.texte}</p>
              </TranslucentBlock>
            </div>
            <div className="flex items-center justify-center rounded-carte bg-sauge px-6 py-16">
              <label className="voile-perle flex w-full max-w-sm items-center gap-3 rounded-capsule px-4 py-2 text-blanc">
                <LieuIcon className="size-7 shrink-0" />
                <span className="sr-only">{t.translucent.fieldLabel}</span>
                <Input placeholder={e.recherche.ville} className="min-h-10 text-center" />
              </label>
            </div>
          </div>
        </Slide>

        <Slide n="22" legend={e.legendes.dialogue}>
          <div className="bg-blanc p-2">
            <SignOutDialog />
          </div>
        </Slide>

        <Slide n="25" legend={e.legendes.cartes}>
          <CardField className="grid gap-6 md:grid-cols-2">
            <TeaserCard
              href="#"
              firstName={e.profil.prenom}
              profession="etudiante_sage_femme_4e"
              zone={[e.profil.commune]}
              reach={{ zoneRadiusKm: 0, zoneWholeBelgium: false }}
              note={{ note: 4.8, gardes: 58 }}
            />
            <RequestCard request={sampleRequest} rate={150} />
          </CardField>
        </Slide>

        <Slide n="26" legend={e.legendes.histoire}>
          <StripedSection blockClassName="max-w-4xl">
            <h3 className="font-display text-h1 text-balance">{story.title}</h3>
            <p>{story.sections[0].paragraphs[0]}</p>
            <div className="flex flex-wrap gap-4">
              <Button variant="taupe" className="h-auto py-3 whitespace-normal">
                {story.boutons.rejoindre}
              </Button>
              <Button variant="taupe" className="h-auto py-3 whitespace-normal">
                {story.boutons.trouver}
              </Button>
            </div>
          </StripedSection>
        </Slide>

        <Slide n="27" legend={e.legendes.temoignages}>
          <div className="bg-blanc p-2">
            <TestimonialRow
              label={e.temoignage.liste}
              starsLabel={e.temoignage.etoiles}
              mark={e.temoignage.exemple}
              testimonials={[e.temoignage, e.temoignage, e.temoignage]}
            />
          </div>
        </Slide>

        <Slide n="29" legend={e.legendes.attente}>
          <PlaceholderPage
            title={e.attente.title}
            text={e.attente.text}
            cta={{ label: e.attente.bouton, href: "#" }}
            titleLevel={3}
          />
        </Slide>

        {/* Yellow stars sit on sage only (slide 27); on white a note keeps its sage stars. */}
        <CardField className="flex flex-col gap-3">
          <NoteDisplay note={{ note: 4.8, gardes: 58 }} className="rounded-carte bg-blanc px-6 py-4" />
        </CardField>
      </Section>
    </>
  );
}
