import { describe, expect, it } from "vitest";

import { validateRequest, type RequestInput } from "./validation";

/**
 * Spec (demande-de-garde): the checkbox is required to publish (D-20); a
 * normal request is for the day after tomorrow up to day 56, an urgent one for
 * tonight or tomorrow night and never a start already past (D-60); the start
 * time, the children and the age are checked against their lists (D-64, D-65).
 */

// 25 September 2026, 12:00 in Brussels.
const NOON = new Date("2026-09-25T10:00:00Z");
// 25 September 2026, 21:10 in Brussels.
const EVENING = new Date("2026-09-25T19:10:00Z");

const valid: RequestInput = {
  date: "2026-09-30",
  heure: "20:00",
  enfants: "un_bebe",
  ageValeur: "3",
  ageUnite: "mois",
  confirmation: true,
};

const publishNormal = { urgent: false, now: NOON, publishing: true };

describe("publishing a normal request", () => {
  it("accepts the guide's fields and returns what is stored", () => {
    expect(validateRequest(valid, publishNormal)).toEqual({
      ok: true,
      values: {
        nightDate: "2026-09-30",
        startTime: "20:00",
        children: "un_bebe",
        babyAgeValue: 3,
        babyAgeUnit: "mois",
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
      { date: "", heure: "", enfants: "", ageValeur: "", ageUnite: "", confirmation: true },
      publishNormal,
    );
    expect(checked).toEqual({
      ok: false,
      errors: { date: "requis", heure: "requis", enfants: "requis", age: "requis" },
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
    expect(refused({ enfants: "triples" })).toEqual({ enfants: "enfants" });
    expect(refused({ ageValeur: "13", ageUnite: "semaines" })).toEqual({ age: "age" });
    expect(refused({ ageValeur: "0", ageUnite: "mois" })).toEqual({ age: "age" });
    expect(refused({ ageValeur: "25", ageUnite: "mois" })).toEqual({ age: "age" });
    expect(refused({ ageValeur: "2.5", ageUnite: "mois" })).toEqual({ age: "age" });
    expect(refused({ ageValeur: "3", ageUnite: "ans" })).toEqual({ age: "age" });
    expect(refused({ ageValeur: "0", ageUnite: "semaines" })).toEqual({});
    expect(refused({ ageValeur: "24", ageUnite: "mois" })).toEqual({});
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
