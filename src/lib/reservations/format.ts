import { fill, words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { reservations } from "@/content/reservations";
import type { Profession } from "@/db/schema";
import { formatDate, formatTime } from "@/lib/demandes/format";
import { endTime, NIGHT_HOURS } from "@/lib/demandes/rules";

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

/** « Sage-femme », as a label. */
export function professionLabel(profession: Profession | null): string {
  return profession ? professions[profession] : "";
}

/** « sage-femme », inside a sentence (« Emma, sage-femme, a postulé »). */
export function professionInSentence(profession: Profession | null): string {
  const label = professionLabel(profession);
  return label.charAt(0).toLocaleLowerCase("fr-BE") + label.slice(1);
}

/** The récapitulatif's three lines about the night: its date, its hours, its duration. */
export function recapNight(nightDate: string, startTime: string): { date: string; heures: string; duree: string } {
  return {
    date: formatDate(nightDate),
    heures: fill(t.recapitulatif.heures, { debut: formatTime(startTime), fin: formatTime(endTime(startTime)) }),
    duree: fill(t.recapitulatif.duree, { n: String(NIGHT_HOURS) }),
  };
}

/** « 1 réponse », « 3 réponses ». */
export function answersCount(n: number): string {
  return n === 1 ? t.famille.uneReponse : fill(t.famille.reponses, { n: String(n) });
}
