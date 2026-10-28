import Link from "next/link";

import { Button } from "@/components/ui/button";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { quiSommesNous } from "@/content/qui-sommes-nous";
import { pageMetadata } from "../page-metadata";

const t = words(quiSommesNous);
const c = words(common);

export const metadata = pageMetadata(t.meta, c.pages.quiSommesNous.href);

/**
 * The founders' story as one column of text: the H1, the first paragraph as
 * the introduction, the rest in order, then the guide's closing sentence and
 * the family's call to action.
 */
export default function QuiSommesNousPage() {
  const [intro, ...paragraphs] = t.paragraphs;
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-h1 text-balance text-encre-sauge">
        {t.title}
      </h1>
      <p className="text-intro">{intro}</p>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <p>{t.closing}</p>
      <Button asChild variant="sauge" className="self-start">
        <Link href={c.pages.inscriptionFamille.href}>
          {c.cta.trouverProfessionnelle}
        </Link>
      </Button>
    </article>
  );
}
