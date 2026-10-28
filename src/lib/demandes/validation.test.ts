import { describe, expect, it } from "vitest";

import { readRequestForm, validateRequest, type RequestInput } from "./validation";

/**
 * Spec (demande-de-garde): the checkbox is required to publish (D-20); a
 * normal request is for the day after tomorrow up to day 56, an urgent one for
 * tonight or tomorrow night and never a start already past (D-60); the start
 * time, the children and the age are checked against their lists (D-64, D-65);
 * the extra hours are whole hours from 0 to 6 (demande-heures-supplementaires).
 * Spec (demande-enfants-alimentation): « Triplés » is a third choice, and one
 * of the three feedings is required to publish and to edit.
 * Spec (demande-adresse-de-la-nuit): the night's commune and its rue with its
 * numéro are required to publish, by the profile's rules; an edit changes the
 * rue, the numéro and the boîte, never the commune.
 * Spec (demande-motif-facultatif): the reason is optional, 300 characters at
 * most, on a publication and on an edit. An empty one is stored as null.
 */

// 25 September 2026, 12:00 in Brussels.
const NOON = new Date("2026-09-25T10:00:00Z");
// 25 September 2026, 21:10 in Brussels.
const EVENING = new Date("2026-09-25T19:10:00Z");

const valid: RequestInput = {
  date: "2026-09-30",
  heure: "20:00",
  heuresSupplementaires: "0",
  enfants: "un_bebe",
  ageValeur: "3",
  ageUnite: "mois",
  alimentation: "allaitement_maternel",
  commune: "1050|Ixelles",
  rue: "Rue du Bailli",
  numero: "12",
  boite: "",
  motif: "",
  confirmation: true,
};

const IXELLES = { postcode: "1050", locality: "Ixelles", ins: "21009", commune: "Ixelles" };

const publishNormal = { urgent: false, now: NOON, publishing: true };

describe("publishing a normal request", () => {
  it("accepts the guide's fields and returns what is stored", () => {
    expect(validateRequest(valid, publishNormal)).toEqual({
      ok: true,
      values: {
        nightDate: "2026-09-30",
        startTime: "20:00",
        extraHours: 0,
        children: "un_bebe",
        babyAgeValue: 3,
        babyAgeUnit: "mois",
        feeding: "allaitement_maternel",
        reason: null,
      },
      place: {
        locality: IXELLES,
        address: { street: "Rue du Bailli", houseNumber: "12", box: null },
      },
    });
  });

  it("refuses it without the checkbox", () => {
    const checked = validateRequest({ ...valid, confirmation: false }, publishNormal);
    expect(checked).toEqual({ ok: false, errors: { confirmation: "confirmation" } });
  });

  it("refuses today, tomorrow and day 57, accepts the day after tomorrow and day 56", () => {
    const dateError = (date: string) => {
      const checked = validateRequest({ ...valid, date }, publishNormal);
      return checked.ok ? undefined : checked.errors.date;
    };
    expect(dateError("2026-09-25")).toBe("date");
    expect(dateError("2026-09-26")).toBe("date");
    expect(dateError("2026-09-27")).toBeUndefined();
    expect(dateError("2026-11-20")).toBeUndefined();
    expect(dateError("2026-11-21")).toBe("date");
  });

  it("asks for every field", () => {
    const checked = validateRequest(
      {
        date: "",
        heure: "",
        heuresSupplementaires: "",
        enfants: "",
        ageValeur: "",
        ageUnite: "",
        alimentation: "",
        commune: "",
        rue: "",
        numero: "",
        boite: "",
        motif: "",
        confirmation: true,
      },
      publishNormal,
    );
    expect(checked).toEqual({
      ok: false,
      errors: {
        date: "requis",
        heure: "requis",
        enfants: "requis",
        age: "requis",
        alimentation: "alimentation",
        commune: "requis",
        rue: "requis",
        numero: "requis",
      },
    });
  });

  it("refuses a start time off the list, an unknown children value and an age out of range", () => {
    const refused = (input: Partial<RequestInput>) => {
      const checked = validateRequest({ ...valid, ...input }, publishNormal);
      return checked.ok ? {} : checked.errors;
    };
    expect(refused({ heure: "17:30" })).toEqual({ heure: "heure" });
    expect(refused({ heure: "23:30" })).toEqual({ heure: "heure" });
    expect(refused({ heure: "20:15" })).toEqual({ heure: "heure" });
    expect(refused({ enfants: "quadruples" })).toEqual({ enfants: "enfants" });
    expect(refused({ ageValeur: "13", ageUnite: "semaines" })).toEqual({ age: "age" });
    expect(refused({ ageValeur: "0", ageUnite: "mois" })).toEqual({ age: "age" });
    expect(refused({ ageValeur: "25", ageUnite: "mois" })).toEqual({ age: "age" });
    expect(refused({ ageValeur: "2.5", ageUnite: "mois" })).toEqual({ age: "age" });
    expect(refused({ ageValeur: "3", ageUnite: "ans" })).toEqual({ age: "age" });
    expect(refused({ ageValeur: "0", ageUnite: "semaines" })).toEqual({});
    expect(refused({ ageValeur: "24", ageUnite: "mois" })).toEqual({});
  });

  it("stores 0 to 6 extra hours, and reads an empty field as 0", () => {
    const extra = (heuresSupplementaires: string) => {
      const checked = validateRequest({ ...valid, heuresSupplementaires }, publishNormal);
      return checked.ok ? checked.values.extraHours : undefined;
    };
    expect(extra("0")).toBe(0);
    expect(extra("2")).toBe(2);
    expect(extra("6")).toBe(6);
    expect(extra("")).toBe(0);
  });

  it("refuses extra hours outside 0 to 6, or a half hour, at the field", () => {
    const refused = (heuresSupplementaires: string) => {
      const checked = validateRequest({ ...valid, heuresSupplementaires }, publishNormal);
      return checked.ok ? {} : checked.errors;
    };
    for (const value of ["7", "-1", "1.5", "1,5", "10", "deux"]) {
      expect(refused(value)).toEqual({ heuresSupplementaires: "heuresSupplementaires" });
    }
  });
});

describe("the children and their feeding", () => {
  const values = (input: Partial<RequestInput>) => {
    const checked = validateRequest({ ...valid, ...input }, publishNormal);
    return checked.ok ? checked.values : checked.errors;
  };

  it("accepts triplets", () => {
    expect(values({ enfants: "triples" })).toMatchObject({ children: "triples" });
  });

  it("accepts each of the three feedings and stores it", () => {
    expect(values({ alimentation: "allaitement_maternel" })).toMatchObject({ feeding: "allaitement_maternel" });
    expect(values({ alimentation: "lait_infantile" })).toMatchObject({ feeding: "lait_infantile" });
    expect(values({ alimentation: "allaitement_mixte" })).toMatchObject({ feeding: "allaitement_mixte" });
  });

  it("refuses a request without a feeding, or with an unknown one", () => {
    expect(values({ alimentation: "" })).toEqual({ alimentation: "alimentation" });
    expect(values({ alimentation: "biberon" })).toEqual({ alimentation: "alimentation" });
  });

  it("asks for the feeding on an edit too", () => {
    const checked = validateRequest(
      { ...valid, alimentation: "" },
      { urgent: false, now: NOON, publishing: false, storedDate: "2026-09-30" },
    );
    expect(checked).toEqual({ ok: false, errors: { alimentation: "alimentation" } });
  });
});

describe("the night's address", () => {
  const errors = (input: Partial<RequestInput>, publishing = true) => {
    const checked = validateRequest({ ...valid, ...input }, { urgent: false, now: NOON, publishing });
    return checked.ok ? {} : checked.errors;
  };

  it("takes the commune of the form, not of the profile", () => {
    const checked = validateRequest({ ...valid, commune: "4000|Liège" }, publishNormal);
    expect(checked.ok && checked.place.locality?.ins).toBe("62063");
  });

  it("refuses a commune that is not an entry of the list", () => {
    expect(errors({ commune: "Ixelles" })).toEqual({ commune: "commune" });
    expect(errors({ commune: "9999|Ixelles" })).toEqual({ commune: "commune" });
  });

  it("requires the rue and the numéro, together, and the boîte only with them", () => {
    expect(errors({ rue: "", numero: "" })).toEqual({ rue: "requis", numero: "requis" });
    expect(errors({ numero: "" })).toEqual({ numero: "adresseIncomplete" });
    expect(errors({ rue: "" })).toEqual({ rue: "adresseIncomplete" });
    expect(errors({ rue: "", numero: "", boite: "3" })).toEqual({
      rue: "requis",
      numero: "requis",
      boite: "boiteSeule",
    });
  });

  it("stores the boîte when there is one, and refuses a value too long", () => {
    const checked = validateRequest({ ...valid, boite: " 3 " }, publishNormal);
    expect(checked.ok && checked.place.address).toEqual({ street: "Rue du Bailli", houseNumber: "12", box: "3" });
    expect(errors({ rue: "r".repeat(121) })).toEqual({ rue: "long" });
  });

  it("never reads the commune on an edit, and still asks for the rue and the numéro", () => {
    const checked = validateRequest({ ...valid, commune: "" }, { urgent: false, now: NOON, publishing: false });
    expect(checked.ok && checked.place.locality).toBeNull();
    expect(errors({ commune: "", rue: "", numero: "" }, false)).toEqual({ rue: "requis", numero: "requis" });
  });
});

describe("publishing an urgent request", () => {
  const urgentAt = (now: Date) => ({ urgent: true, now, publishing: true });

  it("accepts tonight and tomorrow night only", () => {
    expect(validateRequest({ ...valid, date: "2026-09-25" }, urgentAt(NOON)).ok).toBe(true);
    expect(validateRequest({ ...valid, date: "2026-09-26" }, urgentAt(NOON)).ok).toBe(true);
    expect(validateRequest({ ...valid, date: "2026-09-27" }, urgentAt(NOON))).toEqual({
      ok: false,
      errors: { date: "date" },
    });
  });

  it("refuses a night of today whose start time has passed", () => {
    expect(validateRequest({ ...valid, date: "2026-09-25", heure: "21:00" }, urgentAt(EVENING))).toEqual({
      ok: false,
      errors: { heure: "heurePassee" },
    });
    expect(validateRequest({ ...valid, date: "2026-09-25", heure: "21:30" }, urgentAt(EVENING)).ok).toBe(
      true,
    );
  });
});

describe("editing a request", () => {
  const edit = { urgent: false, now: NOON, publishing: false, storedDate: "2026-09-26" };

  it("keeps its stored night even when that night is now inside the last two days", () => {
    // Published for the 26th two days ago; edited on the 25th, only the age changes.
    expect(validateRequest({ ...valid, date: "2026-09-26", ageValeur: "4" }, edit).ok).toBe(true);
  });

  it("holds a new night to today's window", () => {
    expect(validateRequest({ ...valid, date: "2026-09-25" }, edit)).toEqual({
      ok: false,
      errors: { date: "date" },
    });
    expect(validateRequest({ ...valid, date: "2026-09-27" }, edit).ok).toBe(true);
  });

  it("still refuses the stored night once its start has passed", () => {
    const evening = { ...edit, now: new Date("2026-09-26T19:10:00Z"), storedDate: "2026-09-26" };
    expect(validateRequest({ ...valid, date: "2026-09-26", heure: "21:00" }, evening)).toEqual({
      ok: false,
      errors: { heure: "heurePassee" },
    });
  });

  it("does not ask for the checkbox again", () => {
    const checked = validateRequest(
      { ...valid, confirmation: false },
      { urgent: false, now: NOON, publishing: false },
    );
    expect(checked.ok).toBe(true);
  });
});

describe("the optional reason", () => {
  const reasonOf = (motif: string, options = publishNormal) => {
    const checked = validateRequest({ ...valid, motif }, options);
    return checked.ok ? { reason: checked.values.reason } : checked.errors;
  };
  const edit = { urgent: false, now: NOON, publishing: false };

  it("stores an empty answer as null", () => {
    expect(reasonOf("")).toEqual({ reason: null });
    expect(reasonOf("", edit)).toEqual({ reason: null });
  });

  it("stores the answer as written", () => {
    expect(reasonOf("Besoin de repos.\nReprise du travail.")).toEqual({
      reason: "Besoin de repos.\nReprise du travail.",
    });
  });

  it("reads a textarea's CRLF line breaks as one character each", () => {
    const form = new FormData();
    form.set("motif", "  Besoin de repos.\r\nReprise du travail.  ");
    expect(readRequestForm(form).motif).toBe("Besoin de repos.\nReprise du travail.");
  });

  it("accepts 300 characters and refuses 301, counted as Postgres counts them", () => {
    expect(reasonOf("a".repeat(300))).toEqual({ reason: "a".repeat(300) });
    expect(reasonOf("é".repeat(300))).toEqual({ reason: "é".repeat(300) });
    // One emoji is two UTF-16 units and one character.
    expect(reasonOf("👶".repeat(300))).toEqual({ reason: "👶".repeat(300) });
    expect(reasonOf("a".repeat(301))).toEqual({ motif: "motifLong" });
    expect(reasonOf("a".repeat(301), edit)).toEqual({ motif: "motifLong" });
  });
});

/**
 * Spec (demande-nuits-regulieres): « Nuits régulières » replaces the date with
 * the nights ticked in the calendar, from the day after tomorrow to the last
 * day of next month, 31 at most. The other fields apply to every night. The
 * urgent form and an edit are always one night.
 */
describe("regular nights", () => {
  // 25 September 2026: the window runs from 27 September to 31 October.
  const regular = (nuits: string, input: Partial<RequestInput> = {}) =>
    validateRequest({ ...valid, date: "", nature: "reguliere", nuits, ...input }, publishNormal);
  const nightsError = (nuits: string) => {
    const checked = regular(nuits);
    return checked.ok ? undefined : checked.errors.nuits;
  };

  it("returns every night in order, the first as the night of the values", () => {
    const checked = regular("2026-10-09,2026-10-02,2026-10-05");
    expect(checked.ok && checked.nights).toEqual(["2026-10-02", "2026-10-05", "2026-10-09"]);
    expect(checked.ok && checked.values.nightDate).toBe("2026-10-02");
    expect(checked.ok && checked.values.startTime).toBe("20:00");
  });

  it("asks for one night at least, and needs no date", () => {
    expect(regular("")).toEqual({ ok: false, errors: { nuits: "requis" } });
  });

  it("accepts the day after tomorrow and the last day of next month, nothing outside", () => {
    expect(nightsError("2026-09-27,2026-10-31")).toBeUndefined();
    expect(nightsError("2026-09-26")).toBe("nuits");
    expect(nightsError("2026-10-02,2026-11-01")).toBe("nuits");
    expect(nightsError("2026-10-32")).toBe("nuits");
    expect(nightsError("demain")).toBe("nuits");
  });

  it("refuses a night twice and more than 31 nights", () => {
    expect(nightsError("2026-10-02,2026-10-02")).toBe("nuits");
    const days = (count: number) =>
      Array.from({ length: count }, (_, i) => `2026-10-${String(i + 1).padStart(2, "0")}`).join(",");
    expect(nightsError(days(31))).toBeUndefined();
    expect(nightsError(`${days(31)},2026-09-30`)).toBe("nuitsTrop");
  });

  it("checks the other fields as for one night", () => {
    expect(regular("2026-10-02", { heure: "", confirmation: false })).toEqual({
      ok: false,
      errors: { heure: "requis", confirmation: "confirmation" },
    });
  });

  it("is one night on the urgent form and on an edit, whatever is posted", () => {
    const urgent = validateRequest(
      { ...valid, date: "2026-09-25", nature: "reguliere", nuits: "2026-10-02,2026-10-05" },
      { urgent: true, now: NOON, publishing: true },
    );
    expect(urgent.ok && urgent.nights).toBeUndefined();
    expect(urgent.ok && urgent.values.nightDate).toBe("2026-09-25");
    const edit = validateRequest(
      { ...valid, nature: "reguliere", nuits: "2026-10-02,2026-10-05" },
      { urgent: false, now: NOON, publishing: false, storedDate: "2026-09-30" },
    );
    expect(edit.ok && edit.nights).toBeUndefined();
    expect(edit.ok && edit.values.nightDate).toBe("2026-09-30");
  });

  it("leaves a one-off night as it was", () => {
    const checked = validateRequest({ ...valid, nature: "ponctuelle", nuits: "2026-10-02" }, publishNormal);
    expect(checked.ok && checked.values.nightDate).toBe("2026-09-30");
    expect(checked.ok && checked.nights).toBeUndefined();
  });

  it("reads the kind and the nights from the form", () => {
    const form = new FormData();
    form.set("nature", "reguliere");
    form.set("nuits", "2026-10-02,2026-10-05");
    expect(readRequestForm(form)).toMatchObject({ nature: "reguliere", nuits: "2026-10-02,2026-10-05" });
  });
});
