import {
  hasNightStarted,
  isAgeInRange,
  isAgeUnit,
  isChildren,
  isDateInWindow,
  isStartTime,
  type AgeUnit,
  type Children,
} from "./rules";

/**
 * The request form, read and checked. Pure: the server action runs it with the
 * clock, the tests with a fixed one. Errors are catalogue keys; the form looks
 * the words up. The commune is never read from the form: it is the profile's
 * (D-63). Whether the request is urgent comes from the caller, which knows
 * which form was posted, or from the stored request when it is edited.
 */

export type RequestInput = {
  date: string;
  heure: string;
  enfants: string;
  ageValeur: string;
  ageUnite: string;
  /** Present only on the publish form: an edit keeps the stored tick. */
  confirmation: boolean;
};

export type RequestValues = {
  nightDate: string;
  startTime: string;
  children: Children;
  babyAgeValue: number;
  babyAgeUnit: AgeUnit;
};

export type RequestField = "date" | "heure" | "enfants" | "age" | "confirmation";
export type RequestError =
  | "requis"
  | "date"
  | "heurePassee"
  | "heure"
  | "enfants"
  | "age"
  | "confirmation"
  | "doublon";
export type RequestErrors = Partial<Record<RequestField, RequestError>>;

export type Checked =
  | { ok: true; values: RequestValues }
  | { ok: false; errors: RequestErrors };

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function readRequestForm(form: FormData): RequestInput {
  return {
    date: text(form, "date"),
    heure: text(form, "heure"),
    enfants: text(form, "enfants"),
    ageValeur: text(form, "ageValeur"),
    ageUnite: text(form, "ageUnite"),
    confirmation: form.get("confirmation") === "oui",
  };
}

/**
 * Checks a request of kind `urgent` at `now`. `publishing` asks for the
 * checkbox; an edit does not show it again, the tick stored at publication
 * stands.
 */
export function validateRequest(
  input: RequestInput,
  { urgent, now, publishing }: { urgent: boolean; now: Date; publishing: boolean },
): Checked {
  const errors: RequestErrors = {};

  if (!input.date) errors.date = "requis";
  else if (!isDateInWindow(urgent, input.date, now)) errors.date = "date";

  if (!input.heure) errors.heure = "requis";
  else if (!isStartTime(input.heure)) errors.heure = "heure";
  else if (!errors.date && hasNightStarted(input.date, input.heure, now)) errors.heure = "heurePassee";

  if (!input.enfants) errors.enfants = "requis";
  else if (!isChildren(input.enfants)) errors.enfants = "enfants";

  const age = /^\d{1,2}$/.test(input.ageValeur) ? Number(input.ageValeur) : NaN;
  if (!input.ageValeur || !input.ageUnite) errors.age = "requis";
  else if (!isAgeUnit(input.ageUnite) || !isAgeInRange(age, input.ageUnite)) errors.age = "age";

  if (publishing && !input.confirmation) errors.confirmation = "confirmation";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    values: {
      nightDate: input.date,
      startTime: input.heure,
      children: input.enfants as Children,
      babyAgeValue: age,
      babyAgeUnit: input.ageUnite as AgeUnit,
    },
  };
}
