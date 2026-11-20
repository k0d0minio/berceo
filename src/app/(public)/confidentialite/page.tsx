import { PlaceholderPage } from "@/components/vitrine/placeholder-page";
import { VitrineSection } from "@/components/vitrine/section";
import { common } from "@/content/common";
import { legal } from "@/content/legal";
import { words } from "@/content/locale";
import { sleepConsultationEnabled } from "@/lib/consultation-sommeil/config";
import { pageMetadata } from "../page-metadata";

const t = words(legal).confidentialite;
const c = words(common);

/* A placeholder until the founders deliver the text; out of search engines until then. */
export const metadata = pageMetadata(t.meta, c.pages.confidentialite.href, {
  index: false,
});

/* The environment's setting is read on each request, so the page follows it without a new build. */
export const dynamic = "force-dynamic";

/**
 * The privacy page: the placeholder, and one block that names Calendly as the
 * recipient of the booking data of the sleep consultation (JAM-352). The
 * block shows only where the consultation page exists
 * (`src/lib/consultation-sommeil/config.ts`).
 */
export default function ConfidentialitePage() {
  return (
    <>
      <PlaceholderPage title={t.title} text={t.placeholder} />
      {sleepConsultationEnabled() ? (
        <VitrineSection title={t.consultationSommeil.title}>
          <div className="flex max-w-3xl flex-col gap-4 text-taupe">
            {t.consultationSommeil.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </VitrineSection>
      ) : null}
    </>
  );
}
