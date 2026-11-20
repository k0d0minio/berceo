import { demandes } from "@/content/demandes";
import { fill, words } from "@/content/locale";
import { communeName } from "@/lib/communes";

import { endTime, toHourMinute, type AgeUnit, type ChildAge, type Feeding } from "./rules";

/**
 * How a request reads, on the card, in the family's list and in the e-mails:
 * « Garde de nuit à Ixelles », « 30/09/2026 de 20h00 à 7h00 », « Un bébé de
 * trois mois », « Deux enfants : deux semaines et dix-huit mois », « Lait
 * infantile et diversification alimentaire ». Pure, so the tests hold the wording.
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

/** « 30/09/2026 de 20h00 à 7h00 »: the night, its end 11 hours plus its extra hours after its start. */
export function nightLine(nightDate: string, startTime: string, extraHours: number): string {
  return fill(t.nuit, {
    date: formatDate(nightDate),
    debut: formatTime(startTime),
    fin: formatTime(endTime(startTime, extraHours)),
  });
}

/**
 * « de 20h00 à 7h00 »: the hours of regular nights, said once when every night
 * has the same (demande-nuits-regulieres). When the nights differ (JAM-303),
 * one clear line says so, and the request itself gives each night's hours.
 */
export function hoursLine(nights: readonly { startTime: string; extraHours: number }[]): string {
  const [first] = nights;
  const same = nights.every(
    (night) => toHourMinute(night.startTime) === toHourMinute(first.startTime) && night.extraHours === first.extraHours,
  );
  if (!same) return t.horairesDifferents;
  return fill(t.horaire, { debut: formatTime(first.startTime), fin: formatTime(endTime(first.startTime, first.extraHours)) });
}

/** « 7h30 »: the end of a night, for the form's large line (JAM-303). Empty until a start is chosen. */
export function endLine(startTime: string, extraHours: number): string {
  return startTime ? formatTime(endTime(startTime, extraHours)) : "";
}

/** « Aucune », « 30 minutes », « 1 heure », « 1 heure 30 », « 2 heures »: the extra hours as the form's list names them. */
export function extraHoursLabel(extraHours: number): string {
  const o = words(demandes).formulaire.heuresSupplementaires;
  const whole = Math.floor(extraHours);
  const half = extraHours !== whole;
  if (extraHours === 0) return o.aucune;
  if (whole === 0) return o.demiHeure;
  if (whole === 1) return half ? o.uneHeureTrente : o.uneHeure;
  return fill(half ? o.heuresTrente : o.heures, { n: String(whole) });
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

/** « a, b et c »: a list as French reads it. */
function list(items: readonly string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ${t.et} ${items[items.length - 1]}`;
}

/** « {enfants} de trois mois », « {enfants} d'un mois »: « de » elides before « un » and « une », never before « onze » or « huit ». */
function withAge(enfants: string, age: string): string {
  return fill(/^une?\b/.test(age) ? t.enfantsAgeElide : t.enfantsAge, { enfants, age });
}

/**
 * The children of a request (JAM-303): « Un bébé de trois mois » for one,
 * « Deux enfants de six semaines » for children of one age, and each age in
 * the family's order when they differ, « Deux enfants : deux semaines et
 * dix-huit mois ».
 */
export function childrenLine(childAges: readonly ChildAge[]): string {
  const ages = childAges.map((child) => ageText(child.value, child.unit));
  if (ages.length === 1) return withAge(t.enfants.un, ages[0]);
  const enfants = fill(t.enfants.plusieurs, { n: t.enfants.nombres[ages.length] ?? String(ages.length) });
  if (new Set(ages).size === 1) return withAge(enfants, ages[0]);
  return fill(t.enfantsAges, { enfants, ages: list(ages) });
}

/**
 * « Allaitement maternel », « Lait infantile et diversification alimentaire »:
 * every feeding ticked (JAM-303), the first with its capital. Empty for a
 * request published before the field: the caller shows no line then.
 */
export function feedingLine(feedings: readonly Feeding[]): string {
  return list(
    feedings.map((feeding, i) => {
      const words = t.alimentation[feeding];
      return i === 0 ? words : words.charAt(0).toLocaleLowerCase("fr-BE") + words.slice(1);
    }),
  );
}

/** « Garde de nuit à Ixelles »: the commune's name, or the locality for a code the list lost. */
export function cardTitle(communeIns: string, locality: string): string {
  return fill(t.titre, { commune: communeName(communeIns) ?? locality });
}

/** « 1050 Ixelles ». */
export function placeLine(postcode: string, locality: string): string {
  return `${postcode} ${locality}`;
}
