import { Charte } from "@/components/professionnelle/charte";
import { charte } from "@/content/charte";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { pageMetadata } from "../page-metadata";

const t = words(charte);
const c = words(common);

export const metadata = pageMetadata(t.meta, c.pages.charte.href);

/**
 * « Charte des professionnelles Berceo » in full, as each professional accepts
 * it at step 4 (onboarding-retour-1). One column of text, like the founders'
 * story.
 */
export default function ChartePage() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col px-4 py-16 md:px-8 md:py-24">
      <Charte level={1} />
    </article>
  );
}
