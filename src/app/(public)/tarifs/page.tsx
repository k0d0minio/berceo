import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/vitrine/page-header";
import { Photo } from "@/components/vitrine/photo";
import { VitrineSection } from "@/components/vitrine/section";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { photos } from "@/content/photos";
import { tarifs } from "@/content/tarifs";
import { pageMetadata } from "../page-metadata";

const t = words(tarifs);
const c = words(common);
const p = words(photos);

export const metadata = pageMetadata(t.meta, c.pages.tarifs.href);

/**
 * The only numbers the sources give: the professional's night rate between
 * 100 € and 300 €, paid to her directly, and the 3 % fee with its refund
 * rule (D-1, D-2, D-4). No subscription (D-3).
 */
export default function TarifsPage() {
  const blocks = [
    { title: t.tarif.title, paragraphs: t.tarif.paragraphs },
    { title: t.frais.title, paragraphs: t.frais.paragraphs },
    { title: t.compte.title, paragraphs: [t.compte.text] },
  ];

  return (
    <>
      <PageHeader
        title={t.title}
        intro={t.intro}
        aside={<Photo photo={p.oursBerceau} preload />}
      />

      <VitrineSection tone="perle">
        <div className="grid gap-6 lg:grid-cols-3">
          {blocks.map((block) => (
            <Card key={block.title}>
              <CardHeader>
                <h2 className="font-display text-h3 text-encre-sauge">
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
            className="font-semibold text-encre-sauge underline underline-offset-4"
          >
            {t.faq}
          </Link>
        </div>
      </VitrineSection>
    </>
  );
}
