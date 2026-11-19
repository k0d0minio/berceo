import Link from "next/link";

import { BonnetIcon, PiedsIcon } from "@/components/berceo-icons";
import { Button } from "@/components/ui/button";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { quiSommesNous } from "@/content/qui-sommes-nous";
import { pageMetadata } from "../page-metadata";

const t = words(quiSommesNous);
const c = words(common);

export const metadata = pageMetadata(t.meta, c.pages.quiSommesNous.href);

const BLOCK =
  "relative mx-auto flex w-full max-w-4xl flex-col gap-5 rounded-carte bg-taupe p-6 text-blanc [--ring:var(--blanc)] md:px-16 md:py-12";

/** One section of the founders' text: its H2, then its paragraphs or its four named values. */
function Section({ section }: { section: (typeof t.sections)[number] }) {
  // A section holds paragraphs or values; the catalogue holds the other as empty.
  const paragraphs: readonly string[] = section.paragraphs;
  const values: readonly { name: string; text: string }[] = section.values;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-sans text-h3 font-bold text-balance">{section.title}</h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {values.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {values.map((value) => (
            <li key={value.name}>
              <em className="font-semibold">{value.name}</em> {value.text}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/**
 * « Notre histoire », to the DA's slide 26 (JAM-327): the stripes across the
 * page and taupe blocks in front. The first block carries the H1 with the
 * bear hat resting on it, the first section of the founders' text, the
 * deck's two buttons and the feet at its right. The founders' text is the
 * one of round 2, complete (JAM-301; Jamie's answer to question 3): its six
 * other sections follow, each in its own block, so no text sits on the
 * stripes.
 */
export default function QuiSommesNousPage() {
  const [first, ...rest] = t.sections;
  return (
    <article className="motif-raye flex w-full flex-col gap-8 px-3 py-16 md:px-4 md:py-24">
      <div className={BLOCK}>
        <div className="relative self-start pt-6">
          <BonnetIcon
            aria-hidden
            className="pointer-events-none absolute -top-3 left-5 size-12 text-beurre md:left-7 md:size-14"
          />
          <h1 className="relative font-display text-h1 text-balance">{t.title}</h1>
        </div>
        <Section section={first} />
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button asChild variant="taupe" className="h-auto max-w-full py-3 whitespace-normal">
            <Link href={c.pages.inscriptionProfessionnelle.href}>
              {t.boutons.rejoindre}
            </Link>
          </Button>
          <Button asChild variant="taupe" className="h-auto max-w-full py-3 whitespace-normal">
            <Link href={c.pages.inscriptionFamille.href}>{t.boutons.trouver}</Link>
          </Button>
          <PiedsIcon aria-hidden className="size-16 text-beurre max-md:hidden" />
        </div>
      </div>
      {rest.map((section) => (
        <div key={section.title} className={BLOCK}>
          <Section section={section} />
        </div>
      ))}
    </article>
  );
}
