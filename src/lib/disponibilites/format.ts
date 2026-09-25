import { disponibilites } from "@/content/disponibilites";
import { fill, words } from "@/content/locale";
import { addDays } from "@/lib/demandes/rules";

import { weekdayIndex } from "./rules";

/**
 * How a night reads: « Nuit du lundi 12 au mardi 13 octobre », « Nuit du
 * mercredi 30 septembre au jeudi 1er octobre », and the calendar's « Octobre
 * 2026 ». Pure, so the tests hold the wording.
 */

const t = words(disponibilites).nuits;

function parts(date: string): { jour: string; n: string; mois: string } {
  const [, m, d] = date.split("-").map(Number);
  return { jour: t.jours[weekdayIndex(date)], n: d === 1 ? t.premier : String(d), mois: t.mois[m - 1] };
}

/** The night of `date`, from its evening to the next morning. */
export function nightName(date: string): string {
  const start = parts(date);
  const end = parts(addDays(date, 1));
  // The month is said once when both days share it, on each day when they do not.
  const debut = start.mois === end.mois ? fill(t.jour, start) : fill(t.jourMois, start);
  return fill(t.nuit, { debut, fin: fill(t.jourMois, end) });
}

/** « Octobre 2026 » from `2026-10`. */
export function monthHeading(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const name = t.mois[m - 1];
  return fill(t.moisAnnee, { mois: name.charAt(0).toUpperCase() + name.slice(1), annee: String(y) });
}

/** The day number a calendar cell shows. */
export function dayNumber(date: string): string {
  return String(Number(date.slice(8, 10)));
}
