import Link from "next/link";

import {
  CalendrierIcon,
  CoeursIcon,
  DocumentIcon,
  LuneIcon,
  MaisonIcon,
} from "@/components/berceo-icons";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/vitrine/page-header";
import { PersonaSwitch } from "@/components/vitrine/persona-switch";
import { ReasonGrid } from "@/components/vitrine/reason-grid";
import { VitrineSection } from "@/components/vitrine/section";
import { StepList } from "@/components/vitrine/step-list";
import { commentCaMarche } from "@/content/comment-ca-marche";
import { common } from "@/content/common";
import { words } from "@/content/locale";

const t = words(commentCaMarche);
const c = words(common);

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

/** One of Surya's icons for each step of a side, at the DA's service size (JAM-327). */
const stepIcons = {
  familles: [DocumentIcon, CoeursIcon, LuneIcon],
  professionnelles: [DocumentIcon, CalendrierIcon, MaisonIcon],
} as const;

/**
 * One side of « Comment ça marche »: the DA's banner with the switch, the three
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
      />

      <VitrineSection title={page.stepsTitle} tone="perle">
        <StepList steps={page.steps} icons={stepIcons[side]} />
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
