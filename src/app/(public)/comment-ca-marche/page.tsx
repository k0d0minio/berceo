import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/vitrine/page-header";
import { Photo } from "@/components/vitrine/photo";
import { ReasonGrid } from "@/components/vitrine/reason-grid";
import { VitrineSection } from "@/components/vitrine/section";
import { StepList } from "@/components/vitrine/step-list";
import { commentCaMarche } from "@/content/comment-ca-marche";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { photos } from "@/content/photos";
import { pageMetadata } from "../page-metadata";

const t = words(commentCaMarche);
const c = words(common);
const p = words(photos);

export const metadata = pageMetadata(t.meta, c.pages.commentCaMarche.href);

/** Three steps per journey, then what Berceo guarantees (no insurance line, D-8). */
export default function CommentCaMarchePage() {
  return (
    <>
      <PageHeader
        title={t.title}
        intro={t.intro}
        aside={<Photo photo={p.mainsPieds} preload fillHeight />}
      />

      <VitrineSection title={t.familles.title} tone="perle">
        <StepList steps={t.familles.steps} />
        <Button asChild variant="sauge" className="self-start">
          <Link href={c.pages.inscriptionFamille.href}>
            {c.cta.trouverProfessionnelle}
          </Link>
        </Button>
      </VitrineSection>

      <VitrineSection title={t.professionnelles.title}>
        <StepList steps={t.professionnelles.steps} />
        <Button asChild variant="blanc" className="self-start">
          <Link href={c.pages.inscriptionProfessionnelle.href}>
            {c.cta.rejoindreReseau}
          </Link>
        </Button>
      </VitrineSection>

      <VitrineSection title={t.garanties.title} tone="sauge">
        <ReasonGrid items={t.garanties.items} />
      </VitrineSection>
    </>
  );
}
