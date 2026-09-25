import type { Metadata } from "next";
import type { ReactNode } from "react";

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
import { Input } from "@/components/ui/input";
import { StripedSection } from "@/components/ui/striped-section";
import { TranslucentBlock } from "@/components/ui/translucent-block";
import { common } from "@/content/common";
import { designSystem } from "@/content/design-system";
import { words } from "@/content/locale";
import { cn } from "@/lib/utils";

const t = words(designSystem);
const c = words(common);

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
  "encre-sauge": "bg-encre-sauge",
  "encre-taupe": "bg-encre-taupe",
};

const levelClass: Record<string, string> = {
  h1: "font-display text-h1 text-encre-sauge",
  h2: "font-display text-h2 text-encre-sauge",
  nav: "font-display text-nav text-encre-sauge",
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
    hover: "border-encre-sauge bg-encre-sauge text-blanc [transform:scale(1.03)]",
  },
  {
    variant: "raye",
    band: "motif-raye",
    hover: "border-beurre bg-beurre text-encre-taupe [transform:scale(1.03)]",
  },
  {
    variant: "sauge",
    band: "bg-sauge",
    hover: "border-beurre bg-beurre text-encre-sauge [transform:scale(1.03)]",
  },
  {
    /* The taupe row now sits in the white block on the stripes (finition-accueil D-2). */
    variant: "taupe",
    band: "bg-blanc border border-perle",
    hover: "border-beurre bg-beurre text-encre-taupe [transform:scale(1.03)]",
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
      <h2 className="font-display text-h2 text-encre-sauge">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-12 md:px-8 md:pt-20">
        <h1 className="font-display text-h1 text-encre-sauge">{t.meta.title}</h1>
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
        <h2 className="font-display text-h2 text-encre-sauge">{t.striped.title}</h2>
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

      <Section title={t.dialog.title}>
        <p className="text-corps">{t.dialog.hint}</p>
        <div>
          <SignOutDialog />
        </div>
      </Section>
    </>
  );
}
