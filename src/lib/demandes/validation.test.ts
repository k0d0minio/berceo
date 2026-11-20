import { describe, expect, it } from "vitest";

import { childError, readRequestForm, validateRequest, type NightInput, type RequestInput } from "./validation";

/**
 * Spec (demande-de-garde): the checkbox is required to publish (D-20); a
 * normal request is for the day after tomorrow up to day 56, an urgent one for
 * tonight or tomorrow night and never a start already past (D-60); the start
 * time, the children and the age are checked against their lists (D-64, D-65);
 * the extra hours go from 0 to 6 (demande-heures-supplementaires).
 * Spec (JAM-303, feedback round 2): the extra hours go by half hours; a request
 * is for 1 to 4 children, each with its own age, each 24 months at most, and an
 * older child is refused with its own error; one feeding or more is required
 * to publish and to edit, « diversification alimentaire » among them; each
 * regular night has its own start and its own extra hours.
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
  enfants: [{ ageValeur: "3", ageUnite: "mois" }],
  alimentation: ["allaitement_maternel"],
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
        childAges: [{ value: 3, unit: "mois" }],
        feedings: ["allaitement_maternel"],
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
        enfants: [],
        alimentation: [],
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
        alimentation: "alimentation",
        commune: "requis",
        rue: "requis",
        numero: "requis",
      },
    });
  });

  it("refuses a start time off the list", () => {
    const refused = (input: Partial<RequestInput>) => {
      const checked = validateRequest({ ...valid, ...input }, publishNormal);
      return checked.ok ? {} : checked.errors;
    };
    expect(refused({ heure: "17:30" })).toEqual({ heure: "heure" });
    expect(refused({ heure: "23:30" })).toEqual({ heure: "heure" });
    expect(refused({ heure: "20:15" })).toEqual({ heure: "heure" });
  });

  it("stores 0 to 6 extra hours by half hours, and reads an empty field as 0", () => {
    const extra = (heuresSupplementaires: string) => {
      const checked = validateRequest({ ...valid, heuresSupplementaires }, publishNormal);
      return checked.ok ? checked.values.extraHours : undefined;
    };
    expect(extra("0")).toBe(0);
    expect(extra("0.5")).toBe(0.5);
    expect(extra("1.5")).toBe(1.5);
    expect(extra("1,5")).toBe(1.5);
    expect(extra("2")).toBe(2);
    expect(extra("5.5")).toBe(5.5);
    expect(extra("6")).toBe(6);
    expect(extra("")).toBe(0);
  });

  it("refuses extra hours outside 0 to 6, or off the half hour, at the field", () => {
    const refused = (heuresSupplementaires: string) => {
      const checked = validateRequest({ ...valid, heuresSupplementaires }, publishNormal);
      return checked.ok ? {} : checked.errors;
    };
    for (const value of ["6.5", "7", "-1", "1.25", "0.3", "10", "deux"]) {
      expect(refused(value)).toEqual({ heuresSupplementaires: "heuresSupplementaires" });
    }
  });
});

describe("the children (JAM-303)", () => {
  const child = (ageValeur: string, ageUnite: string) => ({ ageValeur, ageUnite });
  const values = (enfants: RequestInput["enfants"]) => {
    const checked = validateRequest({ ...valid, enfants }, publishNormal);
    return checked.ok ? checked.values.childAges : checked.errors;
  };

  it("stores each child with its own age, in the form's order", () => {
    expect(values([child("1", "semaines"), child("18", "mois")])).toEqual([
      { value: 1, unit: "semaines" },
      { value: 18, unit: "mois" },
    ]);
    expect(values([child("0", "semaines")])).toEqual([{ value: 0, unit: "semaines" }]);
    expect(values([child("24", "mois")])).toEqual([{ value: 24, unit: "mois" }]);
  });

  it("accepts four children and refuses a fifth", () => {
    const four = [child("2", "semaines"), child("2", "semaines"), child("12", "mois"), child("24", "mois")];
    expect(values(four)).toHaveLength(4);
    expect(values([...four, child("3", "mois")])).toEqual({ enfants: "enfantsTrop" });
  });

  it("asks for one child at least, and for the age of each child", () => {
    expect(values([])).toEqual({ enfants: "requis" });
    expect(values([child("3", "mois"), child("", "mois")])).toEqual({ enfants: "requis" });
    expect(values([child("3", "")])).toEqual({ enfants: "requis" });
  });

  it("refuses a child of more than 24 months with its own error", () => {
    expect(values([child("25", "mois")])).toEqual({ enfants: "ageTrop" });
    expect(values([child("1", "semaines"), child("36", "mois")])).toEqual({ enfants: "ageTrop" });
    expect(values([child("120", "semaines")])).toEqual({ enfants: "ageTrop" });
  });

  it("refuses an age out of its range, or one that is not a whole number", () => {
    expect(values([child("13", "semaines")])).toEqual({ enfants: "age" });
    expect(values([child("0", "mois")])).toEqual({ enfants: "age" });
    expect(values([child("2.5", "mois")])).toEqual({ enfants: "age" });
    expect(values([child("3", "ans")])).toEqual({ enfants: "age" });
    expect(values([child("-1", "mois")])).toEqual({ enfants: "age" });
  });

  it("names what is wrong with one child, for the form's row", () => {
    expect(childError(child("18", "mois"))).toBeNull();
    expect(childError(child("", "mois"))).toBe("requis");
    expect(childError(child("30", "mois"))).toBe("ageTrop");
    expect(childError(child("13", "semaines"))).toBe("age");
  });

  it("reads each child from the form's repeated fields, one more than the limit at most", () => {
    const form = new FormData();
    for (const [age, unit] of [["1", "semaines"], ["18", "mois"]]) {
      form.append("ageValeur", age);
      form.append("ageUnite", unit);
    }
    expect(readRequestForm(form).enfants).toEqual([child("1", "semaines"), child("18", "mois")]);
    for (let i = 0; i < 6; i += 1) {
      form.append("ageValeur", "3");
      form.append("ageUnite", "mois");
    }
    expect(readRequestForm(form).enfants).toHaveLength(5);
  });
});

describe("the feedings (JAM-303)", () => {
  const values = (alimentation: string[]) => {
    const checked = validateRequest({ ...valid, alimentation }, publishNormal);
    return checked.ok ? checked.values.feedings : checked.errors;
  };

  it("accepts each feeding alone and stores it", () => {
    expect(values(["allaitement_maternel"])).toEqual(["allaitement_maternel"]);
    expect(values(["lait_infantile"])).toEqual(["lait_infantile"]);
    expect(values(["allaitement_mixte"])).toEqual(["allaitement_mixte"]);
    expect(values(["diversification_alimentaire"])).toEqual(["diversification_alimentaire"]);
  });

  it("accepts several feedings and stores them in the list's order", () => {
    expect(values(["diversification_alimentaire", "lait_infantile"])).toEqual([
      "lait_infantile",
      "diversification_alimentaire",
    ]);
  });

  it("refuses a request without a feeding, with an unknown one, or with one twice", () => {
    expect(values([])).toEqual({ alimentation: "alimentation" });
    expect(values(["biberon"])).toEqual({ alimentation: "alimentation" });
    expect(values(["lait_infantile", "biberon"])).toEqual({ alimentation: "alimentation" });
    expect(values(["lait_infantile", "lait_infantile"])).toEqual({ alimentation: "alimentation" });
  });

  it("asks for a feeding on an edit too", () => {
    const checked = validateRequest(
      { ...valid, alimentation: [] },
      { urgent: false, now: NOON, publishing: false, storedDate: "2026-09-30" },
    );
    expect(checked).toEqual({ ok: false, errors: { alimentation: "alimentation" } });
  });

  it("reads every ticked box from the form", () => {
    const form = new FormData();
    form.append("alimentation", "lait_infantile");
    form.append("alimentation", "diversification_alimentaire");
    expect(readRequestForm(form).alimentation).toEqual(["lait_infantile", "diversification_alimentaire"]);
    expect(readRequestForm(new FormData()).alimentation).toEqual([]);
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
    expect(
      validateRequest({ ...valid, date: "2026-09-26", enfants: [{ ageValeur: "4", ageUnite: "mois" }] }, edit).ok,
    ).toBe(true);
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
 * day of next month, 31 at most. The urgent form and an edit are always one
 * night.
 * Spec (JAM-303): each night has its own start and its own extra hours. No
 * value of one night is read for another, and the one-night fields are not
 * read. The children, the feedings, the place and the reason apply to every night.
 */
describe("regular nights", () => {
  // 25 September 2026: the window runs from 27 September to 31 October.
  const hoursOf = (nuits: string, heure = "20:00", heuresSupplementaires = "0"): NightInput[] =>
    nuits
      .split(",")
      .filter(Boolean)
      .map((date) => ({ date, heure, heuresSupplementaires }));
  const regular = (nuits: string, input: Partial<RequestInput> = {}) =>
    validateRequest(
      { ...valid, date: "", heure: "", nature: "reguliere", nuits, horaires: hoursOf(nuits), ...input },
      publishNormal,
    );
  const nightsError = (nuits: string) => {
    const checked = regular(nuits);
    return checked.ok ? undefined : checked.errors.nuits;
  };

  it("returns every night in order with its hours, the first as the night of the values", () => {
    const checked = regular("2026-10-09,2026-10-02,2026-10-05");
    expect(checked.ok && checked.nights).toEqual([
      { nightDate: "2026-10-02", startTime: "20:00", extraHours: 0 },
      { nightDate: "2026-10-05", startTime: "20:00", extraHours: 0 },
      { nightDate: "2026-10-09", startTime: "20:00", extraHours: 0 },
    ]);
    expect(checked.ok && checked.values.nightDate).toBe("2026-10-02");
    expect(checked.ok && checked.values.startTime).toBe("20:00");
  });

  it("keeps each night's own start and extra hours, by half hours", () => {
    const checked = regular("2026-10-02,2026-10-05,2026-10-09", {
      horaires: [
        { date: "2026-10-09", heure: "22:30", heuresSupplementaires: "" },
        { date: "2026-10-02", heure: "19:00", heuresSupplementaires: "1.5" },
        { date: "2026-10-05", heure: "21:00", heuresSupplementaires: "6" },
      ],
    });
    expect(checked.ok && checked.nights).toEqual([
      { nightDate: "2026-10-02", startTime: "19:00", extraHours: 1.5 },
      { nightDate: "2026-10-05", startTime: "21:00", extraHours: 6 },
      { nightDate: "2026-10-09", startTime: "22:30", extraHours: 0 },
    ]);
    expect(checked.ok && checked.values).toMatchObject({ nightDate: "2026-10-02", startTime: "19:00", extraHours: 1.5 });
  });

  it("never copies one night's hours to a night without its own", () => {
    const checked = regular("2026-10-02,2026-10-05", {
      // The one-night fields are posted too: they are not read for a regular night.
      heure: "20:00",
      heuresSupplementaires: "2",
      horaires: [{ date: "2026-10-02", heure: "19:00", heuresSupplementaires: "1" }],
    });
    expect(checked).toEqual({ ok: false, errors: { horaires: "requis" } });
  });

  it("refuses a night whose start is off the list, or whose extra hours are off the half hour", () => {
    const refused = (heure: string, heuresSupplementaires: string) => {
      const checked = regular("2026-10-02,2026-10-05", {
        horaires: [
          { date: "2026-10-02", heure: "20:00", heuresSupplementaires: "0" },
          { date: "2026-10-05", heure, heuresSupplementaires },
        ],
      });
      return checked.ok ? {} : checked.errors;
    };
    expect(refused("", "0")).toEqual({ horaires: "requis" });
    expect(refused("17:00", "0")).toEqual({ horaires: "heure" });
    expect(refused("20:00", "6.5")).toEqual({ horaires: "heuresSupplementaires" });
    expect(refused("20:00", "1.25")).toEqual({ horaires: "heuresSupplementaires" });
    expect(refused("20:00", "5.5")).toEqual({});
  });

  it("asks for one night at least, and needs no date and no one-night start", () => {
    expect(regular("")).toEqual({ ok: false, errors: { nuits: "requis" } });
  });

  it("accepts the day after tomorrow and the last day of next month, nothing outside", () => {
    expect(nightsError("2026-09-27,2026-10-31")).toBeUndefined();
    expect(regular("2026-09-27,2026-10-31").ok).toBe(true);
    expect(nightsError("2026-09-26")).toBe("nuits");
    expect(nightsError("2026-10-02,2026-11-01")).toBe("nuits");
    expect(nightsError("2026-10-32")).toBe("nuits");
    expect(nightsError("demain")).toBe("nuits");
  });

  it("refuses a night twice and more than 31 nights", () => {
    expect(nightsError("2026-10-02,2026-10-02")).toBe("nuits");
    const days = (count: number) =>
      Array.from({ length: count }, (_, i) => `2026-10-${String(i + 1).padStart(2, "0")}`).join(",");
    expect(regular(days(31)).ok).toBe(true);
    expect(nightsError(`${days(31)},2026-09-30`)).toBe("nuitsTrop");
  });

  it("checks the other fields as for one night", () => {
    expect(regular("2026-10-02", { enfants: [], confirmation: false })).toEqual({
      ok: false,
      errors: { enfants: "requis", confirmation: "confirmation" },
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
      { ...valid, heuresSupplementaires: "2.5", nature: "reguliere", nuits: "2026-10-02,2026-10-05" },
      { urgent: false, now: NOON, publishing: false, storedDate: "2026-09-30" },
    );
    expect(edit.ok && edit.nights).toBeUndefined();
    expect(edit.ok && edit.values).toMatchObject({ nightDate: "2026-09-30", startTime: "20:00", extraHours: 2.5 });
  });

  it("leaves a one-off night as it was", () => {
    const checked = validateRequest({ ...valid, nature: "ponctuelle", nuits: "2026-10-02" }, publishNormal);
    expect(checked.ok && checked.values.nightDate).toBe("2026-09-30");
    expect(checked.ok && checked.nights).toBeUndefined();
  });

  it("reads the kind, the nights and each night's own fields from the form", () => {
    const form = new FormData();
    form.set("nature", "reguliere");
    form.set("nuits", "2026-10-05,2026-10-02");
    form.set("heure-2026-10-02", "19:00");
    form.set("heuresSupplementaires-2026-10-02", "1.5");
    form.set("heure-2026-10-05", "21:30");
    expect(readRequestForm(form)).toMatchObject({
      nature: "reguliere",
      nuits: "2026-10-05,2026-10-02",
      horaires: [
        { date: "2026-10-02", heure: "19:00", heuresSupplementaires: "1.5" },
        { date: "2026-10-05", heure: "21:30", heuresSupplementaires: "" },
      ],
    });
  });
});
