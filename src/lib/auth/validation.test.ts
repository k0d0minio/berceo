import { describe, expect, it } from "vitest";

import {
  isSignUpRole,
  normalizePhone,
  passwordErrors,
  readSignUpForm,
  validateSignUp,
  type SignUpInput,
} from "./validation";

const valid: SignUpInput = {
  prenom: "Julie",
  nom: "Dupont",
  email: "Julie.Dupont@Exemple.be",
  telephone: "0470 12 34 56",
  motDePasse: "nuit-calme",
  confirmation: "nuit-calme",
  consentement: true,
};

describe("sign-up validation (spec: invalid input is refused on the field concerned)", () => {
  it("accepts a complete form and normalises e-mail and phone", () => {
    const result = validateSignUp(valid);
    expect(result).toEqual({
      ok: true,
      values: {
        firstName: "Julie",
        lastName: "Dupont",
        email: "julie.dupont@exemple.be",
        phone: "+32470123456",
        password: "nuit-calme",
      },
    });
  });

  it.each([
    ["prenom", { prenom: "  " }, "requis"],
    ["nom", { nom: "" }, "requis"],
    ["email", { email: "" }, "requis"],
    ["email", { email: "julie@" }, "email"],
    ["email", { email: "julie exemple.be" }, "email"],
    ["telephone", { telephone: "" }, "requis"],
    ["telephone", { telephone: "12345" }, "telephone"],
    ["motDePasse", { motDePasse: "", confirmation: "" }, "requis"],
    ["motDePasse", { motDePasse: "court7", confirmation: "court7" }, "motDePasseCourt"],
    ["confirmation", { confirmation: "autre-chose" }, "confirmation"],
    ["consentement", { consentement: false }, "consentement"],
  ] as const)("refuses %s with %o as %s", (field, patch, expected) => {
    const result = validateSignUp({ ...valid, ...patch });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field]).toBe(expected);
  });

  it("reports only the fields that are wrong", () => {
    const result = validateSignUp({ ...valid, prenom: "", consentement: false });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["consentement", "prenom"]);
    }
  });
});

describe("password rules", () => {
  it("accepts 8 to 128 characters with no composition rule", () => {
    expect(passwordErrors("aaaaaaaa", "aaaaaaaa")).toEqual({});
    expect(passwordErrors("a".repeat(128), "a".repeat(128))).toEqual({});
  });

  it("refuses under 8 and over 128", () => {
    expect(passwordErrors("a".repeat(7), "a".repeat(7)).motDePasse).toBe("motDePasseCourt");
    expect(passwordErrors("a".repeat(129), "a".repeat(129)).motDePasse).toBe("motDePasseLong");
  });

  it("requires a matching confirmation", () => {
    expect(passwordErrors("aaaaaaaa", "").confirmation).toBe("requis");
    expect(passwordErrors("aaaaaaaa", "aaaaaaab").confirmation).toBe("confirmation");
  });
});

describe("phone numbers are stored as E.164 (spec: Belgian national and international formats)", () => {
  it.each([
    ["0470 12 34 56", "+32470123456"],
    ["0470/12.34.56", "+32470123456"],
    ["02 123 45 67", "+3221234567"],
    ["+32 470 12 34 56", "+32470123456"],
    ["0032 470 12 34 56", "+32470123456"],
    ["+33 6 12 34 56 78", "+33612345678"],
    ["+32 (0)470 12 34 56", "+32470123456"],
    ["+32 0470 12 34 56", "+32470123456"],
    ["0032 (0)2 123 45 67", "+3221234567"],
    ["(0)470 12 34 56", "+32470123456"],
  ])("%s → %s", (raw, e164) => {
    expect(normalizePhone(raw)).toBe(e164);
  });

  it.each(["", "abc", "470123456", "+0470123456", "0470", "+1234567"])(
    "refuses %o",
    (raw) => {
      expect(normalizePhone(raw)).toBeNull();
    },
  );
});

describe("reading the form", () => {
  it("reads a ticked checkbox as consent and a missing field as empty", () => {
    const form = new FormData();
    form.set("prenom", "Julie");
    form.set("consentement", "on");
    const input = readSignUpForm(form);
    expect(input.prenom).toBe("Julie");
    expect(input.nom).toBe("");
    expect(input.consentement).toBe(true);
    expect(readSignUpForm(new FormData()).consentement).toBe(false);
  });
});

describe("only the two sign-up roles can be signed up (D-33)", () => {
  it.each(["parent", "professionnel"])("%s is accepted", (role) => {
    expect(isSignUpRole(role)).toBe(true);
  });

  it.each(["admin", "", "Parent", null, undefined, 1, {}])("%s is refused", (role) => {
    expect(isSignUpRole(role)).toBe(false);
  });
});
