import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/vitrine/page-header";
import { PersonaSwitch } from "@/components/vitrine/persona-switch";
import { Photo } from "@/components/vitrine/photo";
import { ReasonGrid } from "@/components/vitrine/reason-grid";
import { VitrineSection } from "@/components/vitrine/section";
import { StepList } from "@/components/vitrine/step-list";
import { commentCaMarche } from "@/content/comment-ca-marche";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { photos } from "@/content/photos";

const t = words(commentCaMarche);
const c = words(common);
const p = words(photos);

/**
 * Each side's page address and the one sign-up button it ends with: the
 * family's filled, the professional's outlined, as on the home page's doors.
 */
export const sides = {
  familles: {
    href: c.pages.commentCaMarche.href,
    cta: { label: c.cta.trouverProfessionnelle, href: c.pages.inscriptionFamille.href, variant: "sauge" },
  },
  professionnelles: {
    href: c.pages.commentCaMarcheProfessionnelles.href,
    cta: { label: c.cta.rejoindreReseau, href: c.pages.inscriptionProfessionnelle.href, variant: "blanc" },
  },
} as const;

type Side = keyof typeof sides;

/**
 * One side of « Comment ça marche »: the switch at the top right, the three
 * steps of that side, what Berceo guarantees (no insurance line, D-8), then
 * that side's sign-up button. The family's side closes the guarantees with
 * the charter the professionals accept (charte-cote-parents).
 */
export function SidePage({ side }: { side: Side }) {
  const page = t[side];
  return (
    <>
      <PageHeader
        title={page.title}
        intro={page.intro}
        nav={
          <PersonaSwitch
            label={t.switch.label}
            current={sides[side].href}
            sides={[
              { label: t.switch.parents, href: sides.familles.href },
              { label: t.switch.professionnelles, href: sides.professionnelles.href },
            ]}
          />
        }
        aside={<Photo photo={p.mainsPieds} preload fillHeight />}
      />

      <VitrineSection title={page.stepsTitle} tone="perle">
        <StepList steps={page.steps} />
      </VitrineSection>

      <VitrineSection title={t.garanties.title} tone="sauge">
        <ReasonGrid items={t.garanties.items} />
        {side === "familles" ? (
          <Button asChild variant="blanc" className="self-start">
            <Link href={c.pages.charte.href}>{t.garanties.charte}</Link>
          </Button>
        ) : null}
      </VitrineSection>

      <VitrineSection>
        <Button asChild variant={sides[side].cta.variant} className="self-start">
          <Link href={sides[side].cta.href}>{sides[side].cta.label}</Link>
        </Button>
      </VitrineSection>
    </>
  );
}
