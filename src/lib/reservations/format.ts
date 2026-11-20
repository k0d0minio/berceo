import { fill, words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { reservations } from "@/content/reservations";
import type { Profession } from "@/db/schema";
import { formatDate, formatTime } from "@/lib/demandes/format";
import { endTime, NIGHT_HOURS, START_TIMES, toHourMinute } from "@/lib/demandes/rules";

import { isAdapted, requestedStart, type AdaptedNight } from "./rules";

/**
 * How an answer and a booking read: the price line of the DA's card
 * (« 150 € pour la garde de nuit »), a profession inside a sentence, and the
 * récapitulatif's date, hours and duration (the guide, « La réservation »).
 * Pure, so the tests hold the wording.
 */

const t = words(reservations);
const professions = words(professionnelle).professions;

/** « 150 € pour la garde de nuit »: her rate, the euro after the number (D-4). */
export function rateLine(nightRateEur: number): string {
  return fill(t.tarif, { montant: String(nightRateEur) });
}

/** « 15 € par heure supplémentaire »: her rate for each hour past the night's 11 (profil-tarifs). */
export function extraHourLine(extraHourRateEur: number): string {
  return fill(t.tarifHeure, { montant: String(extraHourRateEur) });
}

/** « Sage-femme », as a label. */
export function professionLabel(profession: Profession | null): string {
  return profession ? professions[profession] : "";
}

/** « sage-femme », inside a sentence (« Emma, sage-femme, a postulé »). */
export function professionInSentence(profession: Profession | null): string {
  const label = professionLabel(profession);
  return label.charAt(0).toLocaleLowerCase("fr-BE") + label.slice(1);
}

/**
 * The récapitulatif's three lines about the night: its date, its hours, its
 * duration. The duration names the extra hours apart from the 11-hour night,
 * because the professional prices them apart (« 11 heures et 2 heures
 * supplémentaires »).
 */
export function recapNight(
  nightDate: string,
  startTime: string,
  extraHours: number,
): { date: string; heures: string; duree: string } {
  const n = String(NIGHT_HOURS);
  const duree =
    extraHours === 0
      ? fill(t.recapitulatif.duree, { n })
      : extraHours === 1
        ? fill(t.recapitulatif.dureeUneSupplementaire, { n })
        : extraHours === 0.5
          ? fill(t.recapitulatif.dureeDemiHeure, { n })
          : Number.isInteger(extraHours)
            ? fill(t.recapitulatif.dureeSupplementaires, { n, extra: String(extraHours) })
            : // Half hours (JAM-303): « 11 heures et 1 h 30 supplémentaires ».
              fill(t.recapitulatif.dureeSupplementairesTrente, { n, extra: String(Math.floor(extraHours)) });
  return {
    date: formatDate(nightDate),
    heures: fill(t.recapitulatif.heures, {
      debut: formatTime(startTime),
      fin: formatTime(endTime(startTime, extraHours)),
    }),
    duree,
  };
}

/** « 1 réponse », « 3 réponses ». */
export function answersCount(n: number): string {
  return n === 1 ? t.famille.uneReponse : fill(t.famille.reponses, { n: String(n) });
}

// ---------------------------------------------------------------------------
// The adapted schedule (JAM-306)
// ---------------------------------------------------------------------------

type Slots = { demande: string; propose: string; fin: string };

function slots(night: AdaptedNight): Slots {
  return { demande: formatTime(night.requested), propose: formatTime(night.proposed), fin: formatTime(night.end) };
}

/**
 * What the family reads of an answer's proposals: « Début à 20h00 au lieu de
 * 19h00. Fin de la garde à 7h00. » for a request of one night, and one line
 * for each night with its date for a regular request.
 */
export function adaptedLines(nights: readonly AdaptedNight[], withDates: boolean): string[] {
  const h = t.famille.horaires;
  return nights.map((night) =>
    withDates
      ? fill(h.ligneNuit, { ...slots(night), date: formatDate(night.nightDate) })
      : fill(h.ligne, slots(night)),
  );
}

/** What the professional reads of her own saved proposal, for one night or a night of a regular request. */
export function ownProposalLine(night: AdaptedNight, ofSeries: boolean): string {
  const h = t.professionnelle.horaires;
  return fill(ofSeries ? h.votrePropositionNuit : h.votreProposition, slots(night));
}

/**
 * The choices of « Proposer une autre heure de début » for a night: every half
 * hour of the request's range but the family's own, each with the end it
 * gives the night. The value is `HH:MM`.
 */
export function proposalOptions(familyStart: string, extraHours: number): { value: string; label: string }[] {
  const h = t.professionnelle.horaires;
  return START_TIMES.filter((slot) => slot !== toHourMinute(familyStart)).map((slot) => ({
    value: slot,
    label: fill(h.option, { heure: formatTime(slot), fin: formatTime(endTime(slot, extraHours)) }),
  }));
}

/**
 * « Horaire adapté : début demandé à 19h00, début convenu à 20h00. » on a
 * booked night whose start is the professional's proposal; null on any other
 * night.
 */
export function agreedStartLine(request: { startTime: string; requestedStartTime?: string | null }): string | null {
  if (!isAdapted(request)) return null;
  return fill(t.horaireConvenu.ligne, {
    demande: formatTime(requestedStart(request)),
    convenu: formatTime(request.startTime),
  });
}
