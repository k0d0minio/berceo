import { describe, expect, it } from "vitest";

import { listedIds, type PastGardeFacts } from "./rules";

/**
 * Spec (favoris-liste): « Mes professionnelles » lists her favourites, then
 * the professionals of her past gardes, without doubles. A past garde is a
 * confirmed one whose night has ended. Written from the acceptance criteria
 * and the pull request's questions (the order inside each block).
 */

// The night of 30 September 2026 from 20:00 ends on 1 October at 07:00 in Brussels (CEST, UTC+2).
function garde(profileId: string, nightDate: string, status: PastGardeFacts["status"] = "confirmee"): PastGardeFacts {
  return { profileId, status, nightDate, startTime: "20:00:00", extraHours: 0 };
}
const NOW = new Date("2026-10-15T12:00:00Z");

describe("listedIds", () => {
  it("puts her marks first, in their order, then the professionals of her past gardes", () => {
    const list = listedIds(["b", "a"], [garde("c", "2026-09-30"), garde("d", "2026-09-20")], NOW);
    expect(list).toEqual({ marked: ["b", "a"], past: ["c", "d"] });
  });

  it("orders the past gardes from the most recent night", () => {
    const list = listedIds([], [garde("d", "2026-09-20"), garde("c", "2026-09-30"), garde("e", "2026-09-25")], NOW);
    expect(list.past).toEqual(["c", "e", "d"]);
  });

  it("lists a profile once: a marked one leaves the past block, a repeated garde counts once", () => {
    const list = listedIds(["c", "c"], [garde("c", "2026-09-30"), garde("d", "2026-09-20"), garde("d", "2026-09-10")], NOW);
    expect(list).toEqual({ marked: ["c"], past: ["d"] });
  });

  it("counts a confirmed garde whose night has ended, and nothing else", () => {
    const ended = garde("c", "2026-09-30");
    const cancelled = garde("d", "2026-09-30", "annulee");
    const coming = garde("e", "2026-10-20");
    expect(listedIds([], [ended, cancelled, coming], NOW).past).toEqual(["c"]);
    // The same night, read before its end: not yet a past garde.
    expect(listedIds([], [ended], new Date("2026-10-01T04:59:00Z")).past).toEqual([]);
    expect(listedIds([], [ended], new Date("2026-10-01T05:00:00Z")).past).toEqual(["c"]);
  });

  it("is empty with no mark and no past garde", () => {
    expect(listedIds([], [], NOW)).toEqual({ marked: [], past: [] });
  });
});
