import { notFound } from "next/navigation";

import { CalendrierIcon, CoeursIcon, EnvoiIcon, LuneIcon } from "@/components/berceo-icons";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/vitrine/page-header";
import { VitrineSection } from "@/components/vitrine/section";
import { StepList } from "@/components/vitrine/step-list";
import { common } from "@/content/common";
import { consultationSommeil } from "@/content/consultation-sommeil";
import { words } from "@/content/locale";
import { sleepConsultationUrl } from "@/lib/consultation-sommeil/config";
import { pageMetadata } from "../page-metadata";

const t = words(consultationSommeil);
const c = words(common);

export const metadata = pageMetadata(t.meta, c.pages.consultationSommeil.href);

/* The environment's setting is read on each request, so the page follows it without a new build. */
export const dynamic = "force-dynamic";

/**
 * « Consultation sommeil » (feedback round 2, JAM-305): the DA's banner, a
 * short text with the page's one button, then three steps on pearl. The
 * button opens the founders' calendar in a new tab. Its address is the value
 * of `SLEEP_CONSULTATION_URL`. Where the environment has no usable address
 * the page is not found, and no link leads to it. The page names no price.
 */
export default function ConsultationSommeilPage() {
  const url = sleepConsultationUrl();
  if (!url) notFound();

  return (
    <>
      <PageHeader title={t.title} intro={t.intro} ornaments={[LuneIcon, CoeursIcon]} />

      <VitrineSection title={t.rendezVous.title}>
        <div className="flex max-w-3xl flex-col gap-4 text-taupe">
          {t.rendezVous.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <Button asChild className="self-start">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {t.rendezVous.bouton}
            <span className="sr-only"> {t.rendezVous.nouvelOnglet}</span>
          </a>
        </Button>
      </VitrineSection>

      <VitrineSection title={t.etapes.title} tone="perle">
        <StepList steps={t.etapes.items} icons={[CalendrierIcon, EnvoiIcon, LuneIcon]} />
      </VitrineSection>
    </>
  );
}
