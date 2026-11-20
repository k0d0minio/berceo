import { describe, expect, it } from "vitest";

import { agreedStartLine } from "@/lib/reservations/format";

import { upcomingGardeLine } from "./format";

/*
 * Written from JAM-350's acceptance criteria: a garde on an account's page
 * shows the record line of an adapted schedule, in the words of the lists
 * « Réservations » and « Demandes », and a night with no adapted schedule
 * reads as it did before.
 */

const other = { name: "Emma Dubois", phone: "0470 12 34 56" };

describe("a garde still standing on an account's page (JAM-350)", () => {
  it("shows the agreed start in its line and the family's start in the record line", () => {
    const garde = { nightDate: "2026-12-12", startTime: "20:00:00", requestedStartTime: "19:00:00", other };
    expect(upcomingGardeLine(garde)).toEqual({
      line: "12/12/2026 à 20h00, avec Emma Dubois (0470 12 34 56)",
      record: "Horaire adapté : début demandé à 19h00, début convenu à 20h00.",
    });
  });

  it("uses the record line of the two lists, not a second wording", () => {
    const garde = { nightDate: "2026-12-12", startTime: "21:30:00", requestedStartTime: "19:00:00", other };
    expect(upcomingGardeLine(garde).record).toBe(agreedStartLine(garde));
  });

  it("reads as before on a night with no adapted schedule", () => {
    const line = "12/12/2026 à 19h00, avec Emma Dubois (0470 12 34 56)";
    expect(upcomingGardeLine({ nightDate: "2026-12-12", startTime: "19:00:00", requestedStartTime: null, other })).toEqual({
      line,
      record: null,
    });
    expect(upcomingGardeLine({ nightDate: "2026-12-12", startTime: "19:00:00", other })).toEqual({ line, record: null });
    // The record equals the start: the booking kept the family's own start.
    expect(
      upcomingGardeLine({ nightDate: "2026-12-12", startTime: "19:00:00", requestedStartTime: "19:00:00", other }).record,
    ).toBeNull();
  });

  it("says when the other side has no phone", () => {
    expect(
      upcomingGardeLine({ nightDate: "2026-12-12", startTime: "19:00:00", other: { name: "Emma Dubois", phone: null } }).line,
    ).toBe("12/12/2026 à 19h00, avec Emma Dubois (Non renseigné)");
  });
});
