import { normalizePhone } from "@/lib/auth/validation";
import { parseLocalityValue, type Locality } from "@/lib/communes";

import { BOX_MAX, CONTEXT_MAX, NUMBER_MAX, STREET_MAX } from "./limits";

/**
 * The profile form's rules, as pure functions so the tests hold them to the
 * spec: prénom, nom and téléphone as at sign-up; a commune that is an entry of
 * the official list; an optional address where the rue and the numéro come
 * together and the boîte only with them; an optional context line of at most
 * 300 characters. The e-mail is not part of the form: it cannot be changed.
 *
 * Errors are catalogue keys, never sentences: `requis` and `telephone` from
 * `comptes.erreurs`, the rest from `famille.profil.erreurs`.
 */

export type ProfileField =
  | "prenom"
  | "nom"
  | "telephone"
  | "commune"
  | "rue"
  | "numero"
  | "boite"
  | "contexte";

export type ProfileError =
  | "requis"
  | "telephone"
  | "commune"
  | "adresseIncomplete"
  | "boiteSeule"
  | "contexteLong"
  | "long";

export type ProfileErrors = Partial<Record<ProfileField, ProfileError>>;

/** What the form posts, as typed. */
export type ProfileInput = Record<ProfileField, string>;

export type ProfileValues = {
  firstName: string;
  lastName: string;
  phone: string;
  locality: Locality;
  street: string | null;
  houseNumber: string | null;
  box: string | null;
  context: string | null;
};

export type ValidatedProfile =
  | { ok: true; values: ProfileValues }
  | { ok: false; errors: ProfileErrors };

/** The form's fields only; anything else posted (an e-mail, a user id) is never read. */
export function readProfileForm(form: FormData): ProfileInput {
  const read = (name: ProfileField) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    prenom: read("prenom"),
    nom: read("nom"),
    telephone: read("telephone"),
    commune: read("commune"),
    rue: read("rue"),
    numero: read("numero"),
    boite: read("boite"),
    contexte: read("contexte"),
  };
}

/** Characters as Postgres's `char_length` counts them (code points, not UTF-16 units). */
export function characterCount(value: string): number {
  return Array.from(value).length;
}

const orNull = (value: string) => (value === "" ? null : value);

export function validateProfile(input: ProfileInput): ValidatedProfile {
  const errors: ProfileErrors = {};

  const firstName = input.prenom.trim();
  const lastName = input.nom.trim();
  if (firstName === "") errors.prenom = "requis";
  if (lastName === "") errors.nom = "requis";

  const phone = normalizePhone(input.telephone);
  if (input.telephone.trim() === "") errors.telephone = "requis";
  else if (phone === null) errors.telephone = "telephone";

  const locality = parseLocalityValue(input.commune.trim());
  if (input.commune.trim() === "") errors.commune = "requis";
  else if (locality === null) errors.commune = "commune";

  const street = input.rue.trim();
  const houseNumber = input.numero.trim();
  const box = input.boite.trim();
  if (street.length > STREET_MAX) errors.rue = "long";
  if (houseNumber.length > NUMBER_MAX) errors.numero = "long";
  if (box.length > BOX_MAX) errors.boite = "long";
  if (street !== "" && houseNumber === "") errors.numero ??= "adresseIncomplete";
  if (houseNumber !== "" && street === "") errors.rue ??= "adresseIncomplete";
  if (box !== "" && street === "" && houseNumber === "") errors.boite ??= "boiteSeule";

  const context = input.contexte.trim();
  if (characterCount(context) > CONTEXT_MAX) errors.contexte = "contexteLong";

  if (Object.keys(errors).length > 0 || phone === null || locality === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    values: {
      firstName,
      lastName,
      phone,
      locality,
      street: orNull(street),
      houseNumber: orNull(houseNumber),
      box: orNull(box),
      context: orNull(context),
    },
  };
}
