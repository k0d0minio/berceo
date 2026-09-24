import { describe, expect, it } from "vitest";

import { readProfileForm, validateProfile, type ProfileInput } from "./validation";

/** A complete, valid form: 1050 Ixelles, no address, no context. */
const valid: ProfileInput = {
  prenom: "Julie",
  nom: "Lambert",
  telephone: "0470 12 34 56",
  commune: "1050|Ixelles",
  rue: "",
  numero: "",
  boite: "",
  contexte: "",
};

const errorsOf = (changes: Partial<ProfileInput>) => {
  const result = validateProfile({ ...valid, ...changes });
  return result.ok ? {} : result.errors;
};

describe("the family profile form", () => {
  it("accepts a commune with no address, and stores the commune's INS code", () => {
    const result = validateProfile(valid);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.values.locality).toEqual({
      postcode: "1050",
      locality: "Ixelles",
      ins: "21009",
      commune: "Ixelles",
    });
    expect(result.values.street).toBeNull();
    expect(result.values.context).toBeNull();
    expect(result.values.phone).toBe("+32470123456");
  });

  it("refuses a missing commune", () => {
    expect(errorsOf({ commune: "" }).commune).toBe("requis");
  });

  it("refuses a commune that is not an entry of the list", () => {
    expect(errorsOf({ commune: "Ixelles" }).commune).toBe("commune");
    expect(errorsOf({ commune: "1050|Bruxelles-sur-Mer" }).commune).toBe("commune");
    expect(errorsOf({ commune: "9999|Ixelles" }).commune).toBe("commune");
  });

  it("requires the rue and the numéro together", () => {
    expect(errorsOf({ rue: "Rue du Bailli" }).numero).toBe("adresseIncomplete");
    expect(errorsOf({ numero: "12" }).rue).toBe("adresseIncomplete");
    expect(errorsOf({ boite: "3" }).boite).toBe("boiteSeule");
  });

  it("accepts a full address, with or without a boîte", () => {
    expect(validateProfile({ ...valid, rue: "Rue du Bailli", numero: "12" }).ok).toBe(true);
    expect(validateProfile({ ...valid, rue: "Rue du Bailli", numero: "12", boite: "3" }).ok).toBe(true);
  });

  it("accepts a context line of 300 characters and refuses 301", () => {
    expect(validateProfile({ ...valid, contexte: "é".repeat(300) }).ok).toBe(true);
    expect(errorsOf({ contexte: "é".repeat(301) }).contexte).toBe("contexteLong");
  });

  it("keeps prénom, nom and téléphone to the sign-up rules", () => {
    expect(errorsOf({ prenom: "  " }).prenom).toBe("requis");
    expect(errorsOf({ nom: "" }).nom).toBe("requis");
    expect(errorsOf({ telephone: "" }).telephone).toBe("requis");
    expect(errorsOf({ telephone: "12" }).telephone).toBe("telephone");
  });

  it("never reads an e-mail or a user id from the form", () => {
    const form = new FormData();
    for (const [name, value] of Object.entries(valid)) form.set(name, value);
    form.set("email", "someone-else@exemple.be");
    form.set("userId", "00000000-0000-0000-0000-000000000000");
    const input = readProfileForm(form);
    expect(input).toEqual(valid);
    expect(Object.keys(input)).not.toContain("email");
  });
});
