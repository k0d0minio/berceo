import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/vitrine/page-header";
import { Photo } from "@/components/vitrine/photo";
import { VitrineSection } from "@/components/vitrine/section";
import { abonnements } from "@/content/abonnements";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { photos } from "@/content/photos";
import { tarifs } from "@/content/tarifs";
import { pageMetadata } from "../page-metadata";

const t = words(tarifs);
const a = words(abonnements);
const c = words(common);
const p = words(photos);

export const metadata = pageMetadata(t.meta, c.pages.tarifs.href);

/**
 * The four family subscriptions in the devis' order, then the professional's
 * night rate from 130 €, paid to her directly, and the 3 % fee with its
 * refund rule (feedback round 1, D-1, D-2).
 */
export default function TarifsPage() {
  const blocks = [
    { title: t.tarif.title, paragraphs: t.tarif.paragraphs },
    { title: t.frais.title, paragraphs: t.frais.paragraphs },
  ];

  return (
    <>
      <PageHeader
        title={t.title}
        intro={t.intro}
        aside={<Photo photo={p.oursBerceau} preload fillHeight />}
      />

      <VitrineSection title={t.abonnements.title} tone="perle">
        <div className="flex max-w-3xl flex-col gap-4 text-taupe">
          {t.abonnements.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {a.plans.map((plan) => (
            <li key={plan.name}>
              <Card className="h-full">
                <CardHeader>
                  <h3 className="text-h3 font-bold text-sauge">
                    {plan.name}
                  </h3>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p>{plan.duree}</p>
                  <p className="font-display text-h2 text-sauge">
                    {plan.prix}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <div className="grid gap-6 lg:grid-cols-2">
          {blocks.map((block) => (
            <Card key={block.title}>
              <CardHeader>
                <h2 className="text-h3 font-bold text-sauge">
                  {block.title}
                </h2>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <Button asChild variant="sauge" className="self-start">
            <Link href={c.pages.inscriptionFamille.href}>
              {c.cta.trouverProfessionnelle}
            </Link>
          </Button>
          <Link
            href={c.pages.faq.href}
            className="font-semibold text-sauge underline underline-offset-4"
          >
            {t.faq}
          </Link>
        </div>
      </VitrineSection>
    </>
  );
}
