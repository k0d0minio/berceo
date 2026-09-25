import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProchainesDisponibilites } from "@/components/disponibilites/prochaines-disponibilites";
import { AcceptAnswer } from "@/components/reservations/accept-answer";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { communeName } from "@/lib/communes";
import { familyRequestPath } from "@/lib/demandes/paths";
import { ownRequest } from "@/lib/demandes/requests";
import { isChangeable } from "@/lib/demandes/rules";
import { nextAvailableNights } from "@/lib/disponibilites/nights";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { familyHasAddress } from "@/lib/famille/profile";
import { isSpecialisation } from "@/lib/professionnelle/rules";
import { waitingAnswerOf } from "@/lib/reservations/answers";
import { feeLine } from "@/lib/paiements/format";
import { professionLabel, rateLine, recapNight } from "@/lib/reservations/format";
import { priorityPath, professionalProfilePath } from "@/lib/reservations/paths";
import { publicProfile } from "@/lib/reservations/profiles";

import { acceptAnswerAction } from "../../demandes/actions";

const r = words(reservations);
const p = words(professionnelle);

export const metadata: Metadata = {
  title: r.meta.profil,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * A professional's full profile, as a family reads it (D-3, D-75): any
 * signed-in family, any validated profile; any other status, like an unknown
 * id, is not found. The DA's profile card (photo, first name, profession,
 * « Profil vérifié par Berceo », her communes) and the rest of her file:
 * spécialisations, experience, presentation, rate, and « Prochaines
 * disponibilités » (D-69, D-80). Never her surname, e-mail,
 * phone, INAMI number or documents. « Lui envoyer ma demande en priorité »
 * always (D-71); « Accepter et réserver » when opened from one of the family's
 * open requests on which her answer waits (`?demande=`).
 */
export default async function ProfilProfessionnellePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demande?: string }>;
}) {
  const { id } = await params;
  const user = await requireAccess(professionalProfilePath(id));
  const profile = await publicProfile(id);
  if (!profile) notFound();

  // Opened from one of her requests: the accept button, when this professional's answer waits on it.
  const { demande } = await searchParams;
  const now = new Date();
  const request = demande ? await ownRequest(user.id, demande) : null;
  const answer =
    request && isChangeable(request, now) ? await waitingAnswerOf(user.id, request.id, profile.id) : null;
  const [hasAddress, nights] = await Promise.all([
    answer ? familyHasAddress(user.id) : Promise.resolve(false),
    nextAvailableNights(profile.id, now),
  ]);

  const specialisations = profile.specialisations.filter(isSpecialisation).map((s) => p.specialisations[s]);
  const communes = profile.communes.map((ins) => communeName(ins) ?? ins).sort((a, b) => a.localeCompare(b, "fr"));

  return (
    <SpaceShell user={user} title={r.meta.profil}>
      <article className="flex max-w-2xl flex-col gap-6 rounded-carte bg-perle px-6 py-8 md:px-10">
        <div className="flex flex-wrap items-center gap-6">
          <ProfessionalPhoto photoId={profile.photoId} prenom={profile.firstName} className="size-28" />
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-h2 text-sauge uppercase">{profile.firstName}</h2>
            <p className="text-corps text-taupe">{professionLabel(profile.profession)}</p>
            <p className="text-legende font-semibold text-taupe">{r.profil.verifie}</p>
          </div>
        </div>
        {profile.nightRateEur ? (
          <p className="text-corps font-semibold text-sauge">{rateLine(profile.nightRateEur)}</p>
        ) : null}
        <dl className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <dt className="text-legende font-semibold text-taupe">{r.profil.zone}</dt>
            <dd className="text-corps text-taupe">{communes.join(", ")}</dd>
          </div>
          {specialisations.length > 0 ? (
            <div className="flex flex-col gap-1">
              <dt className="text-legende font-semibold text-taupe">{r.profil.specialisations}</dt>
              <dd className="text-corps text-taupe">{specialisations.join(", ")}</dd>
            </div>
          ) : null}
          {profile.experience ? (
            <div className="flex flex-col gap-1">
              <dt className="text-legende font-semibold text-taupe">{r.profil.experience}</dt>
              <dd className="text-corps text-taupe">{p.experiences[profile.experience]}</dd>
            </div>
          ) : null}
          {profile.bio ? (
            <div className="flex flex-col gap-1">
              <dt className="text-legende font-semibold text-taupe">{r.profil.bio}</dt>
              <dd className="text-corps whitespace-pre-line text-taupe">{profile.bio}</dd>
            </div>
          ) : null}
        </dl>
      </article>

      <div className="max-w-2xl">
        <ProchainesDisponibilites nights={nights} />
      </div>

      {answer && request && !hasAddress ? (
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="text-corps text-taupe">{r.famille.adresseRequise}</p>
          <Button asChild variant="raye" className="w-fit">
            <Link href={PROFILE_PATH}>{r.famille.completerAdresse}</Link>
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {answer && request && hasAddress ? (
          <AcceptAnswer
            recap={{
              ...recapNight(request.nightDate, request.startTime),
              prenom: profile.firstName,
              profession: professionLabel(profile.profession),
              tarif: rateLine(answer.nightRateEur),
              frais: feeLine(answer.nightRateEur),
            }}
            onAccept={acceptAnswerAction.bind(null, request.id, answer.applicationId)}
          />
        ) : null}
        <Button asChild variant={answer ? "raye" : "blanc"}>
          <Link href={priorityPath(profile.id)}>{r.profil.priorite}</Link>
        </Button>
        {request ? (
          <Button asChild variant="raye">
            <Link href={familyRequestPath(request.id)}>{r.profil.retourDemande}</Link>
          </Button>
        ) : null}
      </div>
    </SpaceShell>
  );
}
