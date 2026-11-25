import Link from "next/link"

import { NoteDisplay } from "@/components/avis/stars"
import { Button } from "@/components/ui/button"
import { words } from "@/content/locale"
import { recherche } from "@/content/recherche"
import type { Profession } from "@/db/schema"
import type { Note } from "@/lib/avis/ratings"
import { professionLabel } from "@/lib/reservations/format"
import { cn } from "@/lib/utils"

/*
 * A professional's public teaser page (D-14): exactly her first name, her
 * profession, « Profil vérifié par Berceo », her communes (each linking to its
 * page) and her radius (zone-rayon-lecture), her note and gardes count, her « Formations complémentaires »
 * (onboarding-retour-1) and « Quelques mots sur moi ». No photo
 * (D-126), no surname, phone, e-mail, address, rate or availability: this
 * component takes those fields one by one, so nothing else can reach the HTML
 * or the page's payload. The call to action is a free family account whose
 * way back is her full profile (D-3, D-129). White cards of 32 px on sage,
 * as the deck shows its profile card (slide 25; JAM-327).
 */

const t = words(recherche)

type TeaserProps = {
  firstName: string
  profession: Profession | null
  bio: string | null
  formations: string | null
  /** Her communes; a commune with an `href` links to its public page. */
  zone: readonly { name: string; href: string | null }[]
  /** Her radius in one line, from `reachLine`: null at 0 km. */
  reach: string | null
  note: Note
}

/**
 * The teaser card alone: the public page shows it on sage with the sign-up
 * call to action; a signed-in family without a subscription reads it in her
 * space, under her own heading, with the invitation line (JAM-582). `level`
 * is the rank of her first name: 1 on the public page, 2 under a space's H1.
 */
function ProfessionalTeaser({
  firstName,
  profession,
  bio,
  formations,
  zone,
  reach,
  note,
  level = 1,
}: TeaserProps & { level?: 1 | 2 }) {
  const Heading = level === 1 ? "h1" : "h2"
  return (
    <article className="flex flex-col gap-6 rounded-carte bg-blanc px-6 py-8 [--ring:var(--sauge)] md:px-10">
      <div className="flex min-w-0 flex-col gap-1">
        <Heading className={cn("font-display break-words text-sauge uppercase", level === 1 ? "text-h1" : "text-h2")}>
          {firstName}
        </Heading>
        <p className="text-intro text-taupe">{professionLabel(profession)}</p>
        <p className="text-legende font-semibold text-taupe">{t.carte.verifie}</p>
      </div>
      <NoteDisplay note={note} />
      <dl className="flex flex-col gap-4">
        {zone.length > 0 ? (
          <div className="flex flex-col gap-1">
            <dt className="text-legende font-semibold text-taupe">{t.fiche.zone}</dt>
            <dd className="text-corps break-words text-taupe">
              {zone.map((commune, i) => (
                <span key={commune.name}>
                  {i > 0 ? ", " : null}
                  {commune.href ? (
                    <Link href={commune.href} className="text-sauge underline underline-offset-4">
                      {commune.name}
                    </Link>
                  ) : (
                    commune.name
                  )}
                </span>
              ))}
            </dd>
            {reach ? <dd className="text-corps break-words text-taupe">{reach}</dd> : null}
          </div>
        ) : null}
        {formations ? (
          <div className="flex flex-col gap-1">
            <dt className="text-legende font-semibold text-taupe">{t.fiche.formations}</dt>
            <dd className="text-corps break-words whitespace-pre-line text-taupe">{formations}</dd>
          </div>
        ) : null}
        {bio ? (
          <div className="flex flex-col gap-1">
            <dt className="text-h3 font-bold text-sauge">{t.fiche.bio}</dt>
            <dd className="text-corps break-words whitespace-pre-line text-taupe">{bio}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  )
}

function PublicProfessional({
  firstName,
  profession,
  bio,
  formations,
  zone,
  reach,
  note,
  signUpHref,
}: TeaserProps & { signUpHref: string }) {
  return (
    <div className="bg-sauge [--ring:var(--blanc)]">
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pt-10 pb-16 md:px-8 md:pt-16">
      <ProfessionalTeaser
        firstName={firstName}
        profession={profession}
        bio={bio}
        formations={formations}
        zone={zone}
        reach={reach}
        note={note}
      />

      <section className="flex flex-col items-start gap-4 rounded-carte bg-blanc px-6 py-8 [--ring:var(--sauge)] md:px-10">
        <h2 className="font-display text-h2 text-sauge">{t.fiche.ctaTitre}</h2>
        <p className="text-corps text-taupe">{t.fiche.ctaTexte}</p>
        <Button asChild variant="sauge" className="h-auto max-w-full py-3 whitespace-normal">
          <Link href={signUpHref}>{t.fiche.ctaBouton}</Link>
        </Button>
      </section>
    </div>
    </div>
  )
}

export { ProfessionalTeaser, PublicProfessional }
