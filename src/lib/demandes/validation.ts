import type { Locality } from "@/lib/communes";
import { characterCount, checkAddress, checkCommune, type Address } from "@/lib/famille/validation";

import {
  hasNightStarted,
  isAgeInRange,
  areFeedings,
  isAgeUnit,
  isChildCount,
  isDateInWindow,
  isIsoDate,
  isStartTime,
  isTooOld,
  MAX_CHILDREN,
  MAX_SERIES_NIGHTS,
  parseExtraHours,
  REASON_MAX,
  seriesWindow,
  sortFeedings,
  type ChildAge,
  type Feeding,
} from "./rules";

/**
 * The request form, read and checked. Pure: the server action runs it with the
 * clock, the tests with a fixed one. Errors are catalogue keys; the form looks
 * the words up. The night's place is the form's, prefilled from the profile
 * (demande-adresse-de-la-nuit, D-63 superseded): a commune of the list and a
 * rue with its numéro, by the profile's rules. The commune is read on a
 * publication only: an edit keeps the stored one. Whether the request is
 * urgent comes from the caller, which knows which form was posted, or from the
 * stored request when it is edited. The reason is optional, on a publication
 * and on an edit (demande-motif-facultatif): empty, it is stored as null.
 * A normal publication is « Nuit ponctuelle » or « Nuits régulières »
 * (demande-nuits-regulieres): regular nights replace the date with the nights
 * ticked in the calendar, each in `seriesWindow`, 31 at most. An urgent
 * publication and an edit are always one night.
 * Each regular night has its own start and its own extra hours (JAM-303): the
 * form posts them as `heure-<date>` and `heuresSupplementaires-<date>`, and no
 * value of one night is read for another. The extra hours go by half hours.
 * The children are 1 to 4, each with its own age, each 24 months at most; the
 * feedings are one answer or more.
 */

/** The form field of one regular night's start: `heure-2026-12-04`. */
export function nightStartField(date: string): string {
  return `heure-${date}`;
}

/** The form field of one regular night's extra hours: `heuresSupplementaires-2026-12-04`. */
export function nightExtraField(date: string): string {
  return `heuresSupplementaires-${date}`;
}

/** One regular night as the form posts it. */
export type NightInput = { date: string; heure: string; heuresSupplementaires: string };

/** One child as the form posts it. */
export type ChildInput = { ageValeur: string; ageUnite: string };

/** One regular night, checked. */
export type SeriesNight = { nightDate: string; startTime: string; extraHours: number };


export type RequestInput = {
  /** « ponctuelle » or « reguliere »: present only on the normal publish form. */
  nature?: string;
  date: string;
  /** The regular nights, `YYYY-MM-DD` joined by commas: present only on the normal publish form. */
  nuits?: string;
  /** The start and the extra hours of each regular night, in the order of `nuits`. */
  horaires?: NightInput[];
  /** One night: its start. Not read on regular nights. */
  heure: string;
  /** One night: the extra hours beyond the 11-hour night, by half hours. Empty reads as 0. */
  heuresSupplementaires: string;
  /** The children, one entry each, in the form's order. */
  enfants: ChildInput[];
  /** Every feeding ticked. */
  alimentation: string[];
  /** Present only on the publish form: an edit keeps the stored commune. */
  commune: string;
  rue: string;
  numero: string;
  boite: string;
  /** The optional « Pourquoi souhaitez-vous être accompagné(e) la nuit ? ». */
  motif: string;
  /** Present only on the publish form: an edit keeps the stored tick. */
  confirmation: boolean;
};

export type RequestValues = {
  nightDate: string;
  startTime: string;
  extraHours: number;
  childAges: ChildAge[];
  /** Empty only on a request published before the field: the form always asks for one. */
  feedings: Feeding[];
  /** Null when she left the question empty. */
  reason: string | null;
};

/** Where the night takes place. The locality is null on an edit: the stored one stands. */
export type RequestPlace = { locality: Locality | null; address: Address };

export type RequestField =
  | "date"
  | "nuits"
  | "horaires"
  | "heure"
  | "heuresSupplementaires"
  | "enfants"
  | "alimentation"
  | "commune"
  | "rue"
  | "numero"
  | "boite"
  | "motif"
  | "confirmation";
export type RequestError =
  | "requis"
  | "commune"
  | "adresseIncomplete"
  | "boiteSeule"
  | "long"
  | "date"
  | "nuits"
  | "nuitsTrop"
  | "heurePassee"
  | "heure"
  | "heuresSupplementaires"
  | "enfantsTrop"
  | "age"
  | "ageTrop"
  | "alimentation"
  | "motifLong"
  | "confirmation"
  | "doublon";
export type RequestErrors = Partial<Record<RequestField, RequestError>>;

export type Checked =
  /**
   * `nights` only on regular nights: every night with its own start and extra
   * hours, in order. `values` then holds the first night's.
   */
  | { ok: true; values: RequestValues; place: RequestPlace; nights?: SeriesNight[] }
  | { ok: false; errors: RequestErrors };

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function texts(form: FormData, name: string): string[] {
  return form.getAll(name).map((value) => (typeof value === "string" ? value.trim() : ""));
}

/** The nights of the `nuits` field, as posted: trimmed, no empty entry, in date order. */
export function splitNights(nuits: string | undefined): string[] {
  return (nuits ?? "").split(",").map((night) => night.trim()).filter(Boolean).sort();
}

export function readRequestForm(form: FormData): RequestInput {
  const nuits = text(form, "nuits");
  const ages = texts(form, "ageValeur");
  const units = texts(form, "ageUnite");
  return {
    nature: text(form, "nature"),
    date: text(form, "date"),
    nuits,
    // Each night's own fields. A posted list longer than a series is cut: the check refuses it by its count.
    horaires: splitNights(nuits)
      .slice(0, MAX_SERIES_NIGHTS + 1)
      .map((date) => ({
        date,
        heure: text(form, nightStartField(date)),
        heuresSupplementaires: text(form, nightExtraField(date)),
      })),
    heure: text(form, "heure"),
    heuresSupplementaires: text(form, "heuresSupplementaires"),
    // One more than the limit is kept, so the check names the limit.
    enfants: ages.slice(0, MAX_CHILDREN + 1).map((ageValeur, i) => ({ ageValeur, ageUnite: units[i] ?? "" })),
    alimentation: texts(form, "alimentation").filter(Boolean),
    commune: text(form, "commune"),
    rue: text(form, "rue"),
    numero: text(form, "numero"),
    boite: text(form, "boite"),
    // A textarea posts its line breaks as CRLF: one character each, as the form's count shows them.
    motif: text(form, "motif").replace(/\r\n?/g, "\n"),
    confirmation: form.get("confirmation") === "oui",
  };
}

/**
 * What is wrong with one child's age, or null. « ageTrop » is a child past 24
 * months, said apart so the family reads why (JAM-303): 30 months, or 3 years
 * typed as 36 months. The form marks the child's row with the same rule.
 */
export function childError(child: ChildInput): "requis" | "age" | "ageTrop" | null {
  if (!child.ageValeur || !child.ageUnite) return "requis";
  if (!isAgeUnit(child.ageUnite) || !/^\d{1,3}$/.test(child.ageValeur)) return "age";
  const age = Number(child.ageValeur);
  if (isTooOld(age, child.ageUnite)) return "ageTrop";
  return isAgeInRange(age, child.ageUnite) ? null : "age";
}

/**
 * Checks a request of kind `urgent` at `now`. `storedDate`, on an edit, is
 * the night already saved: kept as it is, it is not held to today's window
 * (a normal request edited the day before its night keeps its night); a new
 * date is. `publishing` asks for the
 * checkbox and the commune; an edit shows neither again, the tick and the
 * commune stored at publication stand.
 */
export function validateRequest(
  input: RequestInput,
  {
    urgent,
    now,
    publishing,
    storedDate,
  }: { urgent: boolean; now: Date; publishing: boolean; storedDate?: string },
): Checked {
  const errors: RequestErrors = {};
  // Regular nights exist on a normal publication only: the urgent form and the edit never post the field.
  const regular = publishing && !urgent && input.nature === "reguliere";

  let nights: string[] = [];
  if (regular) {
    nights = splitNights(input.nuits);
    const { min, max } = seriesWindow(now);
    if (nights.length === 0) errors.nuits = "requis";
    else if (nights.length > MAX_SERIES_NIGHTS) errors.nuits = "nuitsTrop";
    else if (
      new Set(nights).size !== nights.length ||
      nights.some((night) => !isIsoDate(night) || night < min || night > max)
    ) {
      errors.nuits = "nuits";
    }
  } else if (!input.date) errors.date = "requis";
  else if (input.date !== storedDate && !isDateInWindow(urgent, input.date, now)) errors.date = "date";

  let extraHours = 0;
  const seriesNights: SeriesNight[] = [];
  if (regular) {
    // Each night is read from its own fields: a missing one is an error, never another night's value.
    const posted = new Map((input.horaires ?? []).map((night) => [night.date, night]));
    for (const nightDate of nights) {
      const night = posted.get(nightDate);
      const extra = parseExtraHours(night?.heuresSupplementaires ?? "");
      if (!night?.heure) errors.horaires ??= "requis";
      else if (!isStartTime(night.heure)) errors.horaires ??= "heure";
      else if (Number.isNaN(extra)) errors.horaires ??= "heuresSupplementaires";
      else seriesNights.push({ nightDate, startTime: night.heure, extraHours: extra });
    }
  } else {
    // A series starts the day after tomorrow at the earliest: only one night can have a start already past.
    if (!input.heure) errors.heure = "requis";
    else if (!isStartTime(input.heure)) errors.heure = "heure";
    else if (!errors.date && hasNightStarted(input.date, input.heure, now)) errors.heure = "heurePassee";

    // Half hours only: « 1.25 », « -1 » and « 6.5 » are refused.
    extraHours = parseExtraHours(input.heuresSupplementaires);
    if (Number.isNaN(extraHours)) errors.heuresSupplementaires = "heuresSupplementaires";
  }

  const childAges: ChildAge[] = [];
  if (input.enfants.length === 0) errors.enfants = "requis";
  else if (!isChildCount(input.enfants.length)) errors.enfants = "enfantsTrop";
  else {
    for (const child of input.enfants) {
      const error = childError(child);
      if (error) errors.enfants ??= error;
      else childAges.push({ value: Number(child.ageValeur), unit: child.ageUnite as ChildAge["unit"] });
    }
  }

  // None ticked or one unknown, the error names the answers: required on a publication and on an edit.
  if (!areFeedings(input.alimentation)) errors.alimentation = "alimentation";

  let locality: Locality | null = null;
  if (publishing) {
    const commune = checkCommune(input.commune);
    if (commune.error) errors.commune = commune.error;
    locality = commune.locality;
  }
  const { address, errors: addressErrors } = checkAddress(input, true);
  Object.assign(errors, addressErrors);

  if (characterCount(input.motif) > REASON_MAX) errors.motif = "motifLong";

  if (publishing && !input.confirmation) errors.confirmation = "confirmation";

  if (Object.keys(errors).length > 0 || address === null) return { ok: false, errors };

  return {
    ok: true,
    values: {
      nightDate: regular ? seriesNights[0].nightDate : input.date,
      startTime: regular ? seriesNights[0].startTime : input.heure,
      extraHours: regular ? seriesNights[0].extraHours : extraHours,
      childAges,
      feedings: sortFeedings(input.alimentation as Feeding[]),
      reason: input.motif === "" ? null : input.motif,
    },
    place: { locality, address },
    ...(regular ? { nights: seriesNights } : {}),
  };
}
