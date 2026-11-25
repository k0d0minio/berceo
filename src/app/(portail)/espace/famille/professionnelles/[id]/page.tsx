import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SubscriptionRequired } from "@/components/abonnements/subscription-required";
import { NoteDisplay } from "@/components/avis/stars";
import { ProchainesDisponibilites } from "@/components/disponibilites/prochaines-disponibilites";
import { MarkButton } from "@/components/favoris/mark-button";
import { AcceptAnswer } from "@/components/reservations/accept-answer";
import { AdaptedTimes } from "@/components/reservations/adapted-times";
import { ProfessionalPhoto } from "@/components/reservations/professional-photo";
import { ProfessionalTeaser } from "@/components/recherche/public-professional";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { familyMay } from "@/lib/abonnements/rules";
import { isSubscribed } from "@/lib/abonnements/subscriptions";
import { requireAccess } from "@/lib/auth/guard";
import { withQuery } from "@/lib/auth/routing";
import { communeName } from "@/lib/communes";
import { familyRequestPath } from "@/lib/demandes/paths";
import { ownRequest } from "@/lib/demandes/requests";
import { isChangeable } from "@/lib/demandes/rules";
import { nextAvailableNights } from "@/lib/disponibilites/nights";
import { PROFILE_PATH } from "@/lib/famille/paths";
import { requestHasAddress } from "@/lib/famille/request-address";
import { isMarked } from "@/lib/favoris/favourites";
import { waitingAnswerOf } from "@/lib/reservations/answers";
import { creditShares } from "@/lib/credits/credits";
import { creditRecap, feeLine } from "@/lib/paiements/format";
import { feeCents } from "@/lib/paiements/rules";
import { adaptedLines, extraHourLine, professionLabel, rateLine, recapNight } from "@/lib/reservations/format";
import { adaptedNights, effectiveStart, proposalsSignature } from "@/lib/reservations/rules";
import { priorityPath, professionalProfilePath } from "@/lib/reservations/paths";
import { reachLine, zoneNames } from "@/lib/recherche/rules";
import { publicProfile } from "@/lib/reservations/profiles";

import { acceptAnswerAction } from "../../demandes/actions";
import { markAction } from "../actions";

const r = words(reservations);

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
 * « Formations complémentaires », presentation, rate, and « Prochaines
 * disponibilités » (D-69, D-80). Never her surname, e-mail,
 * phone, INAMI number or documents. « Lui envoyer ma demande en priorité »
 * always (D-71); « Accepter et réserver » when opened from one of the family's
 * open requests on which her answer waits (`?demande=`). Without a
 * subscription her public teaser and the invitation line take the profile's
 * place, from any link (abonnements-acces; the teaser in the space, JAM-582). With one, « Ajouter à mes professionnelles » or
 * « Retirer de mes professionnelles » beside the priority request
 * (favoris-marquer). The profile is a white card on the pearl page (JAM-327).
 */
export default async function ProfilProfessionnellePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demande?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await requireAccess(withQuery(professionalProfilePath(id), query));
  const profile = await publicProfile(id);
  if (!profile) notFound();

  const now = new Date();
  const subscribed = await isSubscribed(user.id, now);
  if (!familyMay("profil", { subscribed })) {
    // Her public teaser, inside the space, then the invitation line (JAM-582).
    return (
      <SpaceShell user={user} title={r.meta.profil}>
        <div className="max-w-2xl">
          <ProfessionalTeaser
            firstName={profile.firstName}
            profession={profile.profession}
            bio={profile.bio}
            formations={profile.formationsComplementaires}
            zone={zoneNames(profile.communes).map((name) => ({ name, href: null }))}
            reach={reachLine(profile)}
            note={profile.note}
            level={2}
          />
        </div>
        <SubscriptionRequired />
      </SpaceShell>
    );
  }

  // Opened from one of her requests: the accept button, when this professional's answer waits on it.
  const { demande } = query;
  const request = demande ? await ownRequest(user.id, demande) : null;
  const answer =
    request && isChangeable(request, now) ? await waitingAnswerOf(user.id, request.id, profile.id) : null;
  const mayMark = familyMay("favori", { subscribed });
  const [hasAddress, nights, marked, shares] = await Promise.all([
    answer && request ? requestHasAddress(user.id, request.id) : Promise.resolve(false),
    nextAvailableNights(profile.id, now),
    mayMark ? isMarked(user.id, profile.id) : Promise.resolve(false),
    // The part her Berceo credit would pay, for the récapitulatif (credits-au-paiement).
    answer ? creditShares(user.id, [feeCents(answer.nightRateEur)], now) : Promise.resolve(new Map<number, number>()),
  ]);

  // What her waiting answer proposes for the night (JAM-306): its lines, and what the family confirms.
  const answered =
    answer && request ? [{ ...request, requestId: request.id, proposedStartTime: answer.proposedStartTime }] : [];
  const adaptedTimes = adaptedLines(adaptedNights(answered), false);

  // Her radius in one line under her chosen communes (zone-rayon-lecture).
  const reach = reachLine(profile);
  const communes = profile.communes.map((ins) => communeName(ins) ?? ins).sort((a, b) => a.localeCompare(b, "fr"));

  return (
    <SpaceShell user={user} title={r.meta.profil}>
      <article className="flex max-w-2xl flex-col gap-6 rounded-carte bg-blanc px-6 py-8 md:px-10">
        <div className="flex flex-wrap items-center gap-6">
          <ProfessionalPhoto photoId={profile.photoId} prenom={profile.firstName} className="size-28" />
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-h2 text-sauge uppercase">{profile.firstName}</h2>
            <p className="text-corps text-taupe">{professionLabel(profile.profession)}</p>
            <p className="text-legende font-semibold text-taupe">{r.profil.verifie}</p>
          </div>
        </div>
        <NoteDisplay note={profile.note} />
        {profile.nightRateEur ? (
          <p className="text-corps font-semibold text-sauge">{rateLine(profile.nightRateEur)}</p>
        ) : null}
        {profile.extraHourRateEur ? (
          <p className="text-corps font-semibold text-sauge">{extraHourLine(profile.extraHourRateEur)}</p>
        ) : null}
        <dl className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <dt className="text-legende font-semibold text-taupe">{r.profil.zone}</dt>
            <dd className="text-corps text-taupe">{communes.join(", ")}</dd>
            {reach ? <dd className="text-corps text-taupe">{reach}</dd> : null}
          </div>
          {profile.formationsComplementaires ? (
            <div className="flex flex-col gap-1">
              <dt className="text-legende font-semibold text-taupe">{r.profil.formations}</dt>
              <dd className="text-corps break-words whitespace-pre-line text-taupe">
                {profile.formationsComplementaires}
              </dd>
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

      {adaptedTimes.length > 0 ? (
        <div className="max-w-2xl rounded-carte bg-blanc px-6 py-6 md:px-10">
          <AdaptedTimes prenom={profile.firstName} lignes={adaptedTimes} />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {answer && request && hasAddress ? (
          <AcceptAnswer
            recap={{
              ...recapNight(
                request.nightDate,
                effectiveStart(request.startTime, answer.proposedStartTime),
                request.extraHours,
              ),
              horairesAdaptes: adaptedTimes,
              prenom: profile.firstName,
              profession: professionLabel(profile.profession),
              tarif: rateLine(answer.nightRateEur),
              tarifHeure: answer.extraHourRateEur ? extraHourLine(answer.extraHourRateEur) : undefined,
              frais: feeLine(answer.nightRateEur),
              ...creditRecap(answer.nightRateEur, shares),
            }}
            onAccept={acceptAnswerAction.bind(null, request.id, answer.applicationId, proposalsSignature(answered))}
          />
        ) : null}
        <Button asChild variant={answer ? "raye" : "blanc"}>
          <Link href={priorityPath(profile.id)}>{r.profil.priorite}</Link>
        </Button>
        {mayMark ? (
          <MarkButton
            marked={marked}
            prenom={profile.firstName}
            onToggle={markAction.bind(null, profile.id, !marked)}
          />
        ) : null}
        {request ? (
          <Button asChild variant="raye">
            <Link href={familyRequestPath(request.id)}>{r.profil.retourDemande}</Link>
          </Button>
        ) : null}
      </div>
    </SpaceShell>
  );
}
