import { demandes } from "@/content/demandes";
import { fill, words } from "@/content/locale";
import { communeName } from "@/lib/communes";

import { endTime, toHourMinute, type AgeUnit, type Children } from "./rules";

/**
 * How a request reads, on the card, in the family's list and in the e-mails:
 * « Garde de nuit à Ixelles », « 30/09/2026 de 20h00 à 7h00 », « Un bébé de
 * trois mois ». Pure, so the tests hold the wording.
 */

const t = words(demandes).carte;

/** « 30/09/2026 » from `2026-09-30`. */
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

/** « 20h00 », « 7h00 » from `20:00` or `07:00:00`. */
export function formatTime(time: string): string {
  const [h, m] = toHourMinute(time).split(":");
  return `${Number(h)}h${m}`;
}

/** « 30/09/2026 de 20h00 à 7h00 »: the night, its end 11 hours after its start. */
export function nightLine(nightDate: string, startTime: string): string {
  return fill(t.nuit, {
    date: formatDate(nightDate),
    debut: formatTime(startTime),
    fin: formatTime(endTime(startTime)),
  });
}

/** « trois mois », « une semaine », « moins d'une semaine ». */
export function ageText(value: number, unit: AgeUnit): string {
  if (unit === "semaines") {
    if (value === 0) return t.age.nouveauNe;
    if (value === 1) return t.age.uneSemaine;
    return fill(t.age.semaines, { n: t.nombres[value] ?? String(value) });
  }
  if (value === 1) return t.age.unMois;
  return fill(t.age.mois, { n: t.nombres[value] ?? String(value) });
}

/** « Un bébé de trois mois », « Jumeaux de six semaines », « Un bébé d'un mois ». */
export function childrenLine(children: Children, value: number, unit: AgeUnit): string {
  const age = ageText(value, unit);
  // « de » elides before « un » and « une », never before « onze » or « huit ».
  const template = /^une?\b/.test(age) ? t.enfantsAgeElide : t.enfantsAge;
  return fill(template, { enfants: t.enfants[children], age });
}

/** « Garde de nuit à Ixelles »: the commune's name, or the locality for a code the list lost. */
export function cardTitle(communeIns: string, locality: string): string {
  return fill(t.titre, { commune: communeName(communeIns) ?? locality });
}

/** « 1050 Ixelles ». */
export function placeLine(postcode: string, locality: string): string {
  return `${postcode} ${locality}`;
}
