import Link from "next/link"

import { NoteDisplay } from "@/components/avis/stars"
import { Button } from "@/components/ui/button"
import { words } from "@/content/locale"
import { recherche } from "@/content/recherche"
import type { Profession } from "@/db/schema"
import type { Note } from "@/lib/avis/ratings"
import { professionLabel } from "@/lib/reservations/format"

/*
 * A professional's public teaser page (D-14): exactly her first name, her
 * profession, « Profil vérifié par Berceo », her communes (each linking to its
 * page), her note and gardes count, and « Quelques mots sur moi ». No photo
 * (D-126), no surname, phone, e-mail, address, rate or availability: this
 * component takes those fields one by one, so nothing else can reach the HTML
 * or the page's payload. The call to action is a free family account whose
 * way back is her full profile (D-3, D-129).
 */

const t = words(recherche)

function PublicProfessional({
  firstName,
  profession,
  bio,
  zone,
  note,
  signUpHref,
}: {
  firstName: string
  profession: Profession | null
  bio: string | null
  zone: readonly { name: string; href: string | null }[]
  note: Note
  signUpHref: string
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pt-10 pb-16 md:px-8 md:pt-16">
      <article className="flex flex-col gap-6 rounded-carte bg-perle px-6 py-8 md:px-10">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-display text-h1 break-words text-encre-sauge uppercase">{firstName}</h1>
          <p className="text-intro text-encre-taupe">{professionLabel(profession)}</p>
          <p className="text-legende font-semibold text-encre-taupe">{t.carte.verifie}</p>
        </div>
        <NoteDisplay note={note} />
        <dl className="flex flex-col gap-4">
          {zone.length > 0 ? (
            <div className="flex flex-col gap-1">
              <dt className="text-legende font-semibold text-encre-taupe">{t.fiche.zone}</dt>
              <dd className="text-corps break-words text-encre-taupe">
                {zone.map((commune, i) => (
                  <span key={commune.name}>
                    {i > 0 ? ", " : null}
                    {commune.href ? (
                      <Link href={commune.href} className="text-encre-sauge underline underline-offset-4">
                        {commune.name}
                      </Link>
                    ) : (
                      commune.name
                    )}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
          {bio ? (
            <div className="flex flex-col gap-1">
              <dt className="font-display text-h3 text-encre-sauge">{t.fiche.bio}</dt>
              <dd className="text-corps break-words whitespace-pre-line text-encre-taupe">{bio}</dd>
            </div>
          ) : null}
        </dl>
      </article>

      <section className="flex flex-col items-start gap-4 rounded-carte bg-blanc px-6 py-8 md:px-10">
        <h2 className="font-display text-h2 text-encre-sauge">{t.fiche.ctaTitre}</h2>
        <p className="text-corps text-encre-taupe">{t.fiche.ctaTexte}</p>
        <Button asChild variant="sauge" className="h-auto max-w-full py-3 whitespace-normal">
          <Link href={signUpHref}>{t.fiche.ctaBouton}</Link>
        </Button>
      </section>
    </div>
  )
}

export { PublicProfessional }
