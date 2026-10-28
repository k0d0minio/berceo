import type { Locality } from "@/lib/communes";
import { characterCount, checkAddress, checkCommune, type Address } from "@/lib/famille/validation";

import {
  hasNightStarted,
  isAgeInRange,
  isAgeUnit,
  isChildren,
  isDateInWindow,
  isExtraHours,
  isFeeding,
  isStartTime,
  REASON_MAX,
  type AgeUnit,
  type Children,
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
 */

export type RequestInput = {
  date: string;
  heure: string;
  /** Whole extra hours beyond the 11-hour night. Empty reads as 0. */
  heuresSupplementaires: string;
  enfants: string;
  ageValeur: string;
  ageUnite: string;
  alimentation: string;
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
  children: Children;
  babyAgeValue: number;
  babyAgeUnit: AgeUnit;
  feeding: Feeding;
  /** Null when she left the question empty. */
  reason: string | null;
};

/** Where the night takes place. The locality is null on an edit: the stored one stands. */
export type RequestPlace = { locality: Locality | null; address: Address };

export type RequestField =
  | "date"
  | "heure"
  | "heuresSupplementaires"
  | "enfants"
  | "age"
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
  | "heurePassee"
  | "heure"
  | "heuresSupplementaires"
  | "enfants"
  | "age"
  | "alimentation"
  | "motifLong"
  | "confirmation"
  | "doublon";
export type RequestErrors = Partial<Record<RequestField, RequestError>>;

export type Checked =
  | { ok: true; values: RequestValues; place: RequestPlace }
  | { ok: false; errors: RequestErrors };

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function readRequestForm(form: FormData): RequestInput {
  return {
    date: text(form, "date"),
    heure: text(form, "heure"),
    heuresSupplementaires: text(form, "heuresSupplementaires"),
    enfants: text(form, "enfants"),
    ageValeur: text(form, "ageValeur"),
    ageUnite: text(form, "ageUnite"),
    alimentation: text(form, "alimentation"),
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

  if (!input.date) errors.date = "requis";
  else if (input.date !== storedDate && !isDateInWindow(urgent, input.date, now)) errors.date = "date";

  if (!input.heure) errors.heure = "requis";
  else if (!isStartTime(input.heure)) errors.heure = "heure";
  else if (!errors.date && hasNightStarted(input.date, input.heure, now)) errors.heure = "heurePassee";

  // Whole hours only: « 1.5 », « 1,5 », « -1 » and « 7 » are refused.
  const extra = input.heuresSupplementaires;
  const extraHours = extra === "" ? 0 : /^\d$/.test(extra) ? Number(extra) : NaN;
  if (!isExtraHours(extraHours)) errors.heuresSupplementaires = "heuresSupplementaires";

  if (!input.enfants) errors.enfants = "requis";
  else if (!isChildren(input.enfants)) errors.enfants = "enfants";

  const age = /^\d{1,2}$/.test(input.ageValeur) ? Number(input.ageValeur) : NaN;
  if (!input.ageValeur || !input.ageUnite) errors.age = "requis";
  else if (!isAgeUnit(input.ageUnite) || !isAgeInRange(age, input.ageUnite)) errors.age = "age";

  // Missing or unknown, the error names the three answers: required on a publication and on an edit.
  if (!isFeeding(input.alimentation)) errors.alimentation = "alimentation";

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
      nightDate: input.date,
      startTime: input.heure,
      extraHours,
      children: input.enfants as Children,
      babyAgeValue: age,
      babyAgeUnit: input.ageUnite as AgeUnit,
      feeding: input.alimentation as Feeding,
      reason: input.motif === "" ? null : input.motif,
    },
    place: { locality, address },
  };
}
