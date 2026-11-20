import { notFound } from "next/navigation";

import { CalendrierIcon, CoeursIcon, EnvoiIcon, LuneIcon } from "@/components/berceo-icons";
import { PageHeader } from "@/components/vitrine/page-header";
import { VitrineSection } from "@/components/vitrine/section";
import { StepList } from "@/components/vitrine/step-list";
import { common } from "@/content/common";
import { consultationSommeil } from "@/content/consultation-sommeil";
import { words } from "@/content/locale";
import { SIGN_IN_PATH } from "@/lib/auth/routing";
import { sleepConsultationUrl } from "@/lib/consultation-sommeil/config";
import { canEmbed } from "@/lib/consultation-sommeil/embed";
import { pageMetadata } from "../page-metadata";
import { CalendarEmbed } from "./calendar-embed";

const t = words(consultationSommeil);
const c = words(common);

export const metadata = pageMetadata(t.meta, c.pages.consultationSommeil.href);

/* The environment's setting is read on each request, so the page follows it without a new build. */
export const dynamic = "force-dynamic";

/**
 * « Consultation sommeil » (feedback round 2, JAM-305): the DA's banner, a
 * short text with the page's one button, then three steps on pearl. The
 * button shows the founders' calendar in the page, in a plain frame that
 * loads only after the click (`CalendarEmbed`, JAM-352): before the click the
 * page makes no request to Calendly, and it never loads a script of Calendly.
 * With no JavaScript the button is a link to the calendar. The calendar's
 * address is the value of `SLEEP_CONSULTATION_URL`. Where the environment has
 * no usable address the page is not found, and no link leads to it. The page
 * names no price.
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
        <CalendarEmbed
          url={url}
          embed={canEmbed(url)}
          labels={{
            bouton: t.rendezVous.bouton,
            service: t.rendezVous.service,
            cadre: t.rendezVous.cadre,
            confirme: t.rendezVous.confirme,
          }}
          homePath="/"
          spacePath={SIGN_IN_PATH}
        />
      </VitrineSection>

      <VitrineSection title={t.etapes.title} tone="perle">
        <StepList steps={t.etapes.items} icons={[CalendrierIcon, EnvoiIcon, LuneIcon]} />
      </VitrineSection>
    </>
  );
}
