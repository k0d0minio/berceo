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
 * The founders' story as one column of text (round 2, JAM-301): the H1, then
 * each section under its H2, the values as four items whose name leads in italics,
 * as in the founders' text, then the family's call to action.
 */
export default function QuiSommesNousPage() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-h1 text-balance text-sauge">
        {t.title}
      </h1>
      {t.sections.map((section) => {
        // A section holds paragraphs or values; the catalogue holds the other as empty.
        const paragraphs: readonly string[] = section.paragraphs;
        const values: readonly { name: string; text: string }[] = section.values;
        return (
          <section key={section.title} className="flex flex-col gap-4">
            <h2 className="font-display text-h2 text-balance text-sauge">
              {section.title}
            </h2>
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {values.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {values.map((value) => (
                  <li key={value.name}>
                    <em className="font-semibold text-sauge">{value.name}</em>{" "}
                    {value.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
      <Button asChild variant="sauge" className="self-start">
        <Link href={c.pages.inscriptionFamille.href}>
          {c.cta.trouverProfessionnelle}
        </Link>
      </Button>
    </article>
  );
}
