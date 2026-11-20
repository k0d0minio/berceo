import Link from "next/link";
import { notFound } from "next/navigation";

import { CalendrierIcon, CoeursIcon, EnvoiIcon, LuneIcon } from "@/components/berceo-icons";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/vitrine/page-header";
import { VitrineSection } from "@/components/vitrine/section";
import { StepList } from "@/components/vitrine/step-list";
import { consultationSommeil } from "@/content/consultation-sommeil";
import { words } from "@/content/locale";
import { SIGN_IN_PATH } from "@/lib/auth/routing";
import {
  SLEEP_CONSULTATION_CONFIRMATION_PATH,
  SLEEP_CONSULTATION_PATH,
  sleepConsultationEnabled,
} from "@/lib/consultation-sommeil/config";
import { pageMetadata } from "../../page-metadata";
import { CleanAddress } from "./clean-address";

const t = words(consultationSommeil).confirmation;

/* Never indexed. The canonical address is the fixed path, with no parameter. */
export const metadata = pageMetadata(t.meta, SLEEP_CONSULTATION_CONFIRMATION_PATH, { index: false });

/* The environment's setting is read on each request, so the page follows it without a new build. */
export const dynamic = "force-dynamic";

/**
 * The page that the founders' calendar sends a visitor back to after a
 * booking (JAM-352). It takes no props: it reads no parameter of its address,
 * no cookie and no session, and it shows the same words to each visitor. The
 * calendar can add the visitor's name and e-mail address to the address. The
 * page ignores them, `CleanAddress` takes them out of the address bar, and
 * each link is a fixed path. The page exists only where the consultation page
 * exists, it is not in the sitemap, and it names no price.
 *
 * The ways on: the home, the sign-in page (which sends a signed-in person to
 * their own space, as the header's account icon does), and the consultation
 * page for a visitor who has no slot yet.
 */
export default function ConsultationSommeilConfirmationPage() {
  if (!sleepConsultationEnabled()) notFound();

  return (
    <>
      <CleanAddress path={SLEEP_CONSULTATION_CONFIRMATION_PATH} />
      <PageHeader title={t.title} intro={t.intro} ornaments={[LuneIcon, CoeursIcon]} />

      <VitrineSection title={t.suite.title}>
        <div className="flex max-w-3xl flex-col gap-4 text-taupe">
          {t.suite.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild>
            <Link href="/">{t.suite.accueil}</Link>
          </Button>
          <Button asChild>
            <Link href={SIGN_IN_PATH}>{t.suite.espace}</Link>
          </Button>
        </div>
        <Link
          href={SLEEP_CONSULTATION_PATH}
          className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
        >
          {t.suite.consultation}
        </Link>
      </VitrineSection>

      <VitrineSection title={t.etapes.title} tone="perle">
        <StepList steps={t.etapes.items} icons={[EnvoiIcon, CalendrierIcon, LuneIcon]} />
      </VitrineSection>
    </>
  );
}
