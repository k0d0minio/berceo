import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalendrierIcon, EnvoiIcon, LuneIcon } from "@/components/berceo-icons";
import { SpaceShell } from "@/components/shell/space-shell";
import { StepList } from "@/components/vitrine/step-list";
import { consultationSommeil } from "@/content/consultation-sommeil";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { sleepConsultationUrl } from "@/lib/consultation-sommeil/config";
import { canEmbed } from "@/lib/consultation-sommeil/embed";
import { FAMILY_SLEEP_CONSULTATION_PATH } from "@/lib/famille/paths";
import { CalendarEmbed } from "@/app/(public)/consultation-sommeil/calendar-embed";

const t = words(consultationSommeil);

export const metadata: Metadata = {
  title: t.meta.title,
  robots: { index: false, follow: false },
};

/* The environment's setting is read on each request, as on the public page. */
export const dynamic = "force-dynamic";

/*
 * « Consultation sommeil », opened from the family's home (JAM-582): the
 * words and the calendar of `/consultation-sommeil`, inside her signed-in
 * shell, so she keeps her navigation. The calendar loads only after her click
 * (`CalendarEmbed`, JAM-352). After a booking, the one way on is her space.
 * Where the environment has no usable address the page is not found, and the
 * home shows no link to it.
 */
export default async function ConsultationSommeilFamillePage() {
  const user = await requireAccess(FAMILY_SLEEP_CONSULTATION_PATH);
  const url = sleepConsultationUrl();
  if (!url) notFound();

  return (
    <SpaceShell user={user} title={t.title}>
      <p className="max-w-3xl text-intro text-taupe">{t.intro}</p>
      {/* A long text reads on white (DA, slide 14; JAM-327). */}
      <section className="flex flex-col gap-4 rounded-carte bg-blanc px-6 py-8 text-taupe md:px-10">
        <h2 className="font-display text-h2 text-sauge">{t.rendezVous.title}</h2>
        {t.rendezVous.paragraphs.map((paragraph) => (
          <p key={paragraph} className="max-w-3xl">
            {paragraph}
          </p>
        ))}
        <CalendarEmbed
          url={url}
          embed={canEmbed(url)}
          labels={{
            bouton: t.rendezVous.bouton,
            service: t.rendezVous.service,
            cadre: t.rendezVous.cadre,
            confirme: t.rendezVous.confirme,
          }}
          homePath={null}
          spacePath={SPACES.parent}
        />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-h2 text-sauge">{t.etapes.title}</h2>
        <StepList steps={t.etapes.items} icons={[CalendrierIcon, EnvoiIcon, LuneIcon]} />
      </section>
    </SpaceShell>
  );
}
