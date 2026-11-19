import { DocumentIcon, CoeursIcon } from "@/components/berceo-icons";
import { Charte } from "@/components/professionnelle/charte";
import { PageHeader } from "@/components/vitrine/page-header";
import { charte } from "@/content/charte";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { pageMetadata } from "../page-metadata";

const t = words(charte);
const c = words(common);

export const metadata = pageMetadata(t.meta, c.pages.charte.href);

/**
 * « Charte des professionnelles Berceo » in full, as each professional accepts
 * it at step 4 (onboarding-retour-1). The DA's banner carries the title
 * (slide 10; JAM-327), then one column of text on white: a long text never
 * sits in a transparent block or on the stripes (slide 14).
 */
export default function ChartePage() {
  return (
    <>
      <PageHeader title={t.title} ornaments={[CoeursIcon, DocumentIcon]} />
      <article className="mx-auto flex max-w-2xl flex-col px-4 py-12 md:px-8 md:py-20">
        <Charte level={1} hideTitle />
      </article>
    </>
  );
}
