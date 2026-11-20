import { describe, expect, it } from "vitest";

import { groupForDigest, groupForList, groupForProfessional } from "./series";

/**
 * Spec (demande-nuits-regulieres): « Mes demandes » shows regular nights as one
 * entry in the place of the first night listed, its nights in date order. The
 * digest shows the nights of a series as one line when they read the same. A
 * night edited apart from its series is a line of its own, and a one-off night
 * is never merged.
 */

type Row = {
  id: string;
  seriesId: string | null;
  nightDate: string;
  startTime: string;
  extraHours: number;
  childAges: { value: number; unit: "semaines" | "mois" }[];
  communeIns: string;
};

function row(id: string, nightDate: string, seriesId: string | null = null, changes: Partial<Row> = {}): Row {
  return {
    id,
    seriesId,
    nightDate,
    startTime: "20:00:00",
    extraHours: 0,
    childAges: [{ value: 3, unit: "mois" }],
    communeIns: "21009",
    ...changes,
  };
}

describe("« Mes demandes »", () => {
  it("puts a series in the place of its first night listed, with its nights in date order", () => {
    const entries = groupForList([
      row("a", "2026-11-03"),
      row("s2", "2026-11-09", "S"),
      row("b", "2026-11-12"),
      row("s1", "2026-11-05", "S"),
    ]);
    expect(entries.map((entry) => (entry.kind === "nuit" ? entry.request.id : entry.seriesId))).toEqual(["a", "S", "b"]);
    const series = entries[1];
    expect(series.kind === "serie" && series.requests.map((night) => night.id)).toEqual(["s1", "s2"]);
  });

  it("keeps two series apart, and a series of one night left is still a series", () => {
    const entries = groupForList([row("x", "2026-11-03", "X"), row("y", "2026-11-04", "Y"), row("x2", "2026-11-05", "X")]);
    expect(entries.map((entry) => entry.kind)).toEqual(["serie", "serie"]);
    expect(entries.map((entry) => (entry.kind === "serie" ? entry.requests.length : 0))).toEqual([2, 1]);
  });
});

describe("the digest's lines", () => {
  const ids = (lines: Row[][]) => lines.map((line) => line.map((night) => night.id));

  it("is one line for the nights of one series, in night order", () => {
    expect(ids(groupForDigest([row("s2", "2026-11-09", "S"), row("s1", "2026-11-05", "S")]))).toEqual([["s1", "s2"]]);
  });

  it("never merges one-off nights, even when they read the same", () => {
    expect(ids(groupForDigest([row("a", "2026-11-05"), row("b", "2026-11-06")]))).toEqual([["a"], ["b"]]);
  });

  it("keeps the nights of one series on one line when their hours differ (JAM-303)", () => {
    const lines = groupForDigest([
      row("s1", "2026-11-05", "S"),
      row("s2", "2026-11-06", "S", { startTime: "21:00:00" }),
      row("s3", "2026-11-07", "S"),
      row("s4", "2026-11-08", "S", { extraHours: 1.5 }),
    ]);
    expect(ids(lines)).toEqual([["s1", "s2", "s3", "s4"]]);
  });

  it("puts a night whose children were edited apart from its series on a line of its own", () => {
    const lines = groupForDigest([
      row("s1", "2026-11-05", "S"),
      row("s2", "2026-11-06", "S", { childAges: [{ value: 3, unit: "mois" }, { value: 18, unit: "mois" }] }),
      row("s3", "2026-11-07", "S"),
    ]);
    expect(ids(lines)).toEqual([["s1", "s3"], ["s2"]]);
  });

  it("orders the lines by their first night, a series among the one-off nights", () => {
    const lines = groupForDigest([row("b", "2026-11-10"), row("s1", "2026-11-12", "S"), row("a", "2026-11-04"), row("s0", "2026-11-06", "S")]);
    expect(ids(lines)).toEqual([["a"], ["s0", "s1"], ["b"]]);
  });
});

/**
 * Spec (JAM-302): her list shows a regular request answered as one once, with
 * all its nights in date order. A night of a series published before JAM-302
 * stays a night of its own (Q3).
 */
describe("groupForProfessional", () => {
  const night = (id: string, seriesId: string | null, seriesWhole: boolean, nightDate: string) => ({
    id,
    seriesId,
    seriesWhole,
    nightDate,
  });

  it("shows a whole regular request once, in the place of its first night, its nights in order", () => {
    const rows = [
      night("a", "s1", true, "2026-12-03"),
      night("b", null, false, "2026-12-01"),
      night("c", "s1", true, "2026-12-02"),
    ];
    expect(groupForProfessional(rows)).toEqual([
      { kind: "serie", seriesId: "s1", requests: [rows[2], rows[0]] },
      { kind: "nuit", request: rows[1] },
    ]);
  });

  it("keeps the nights of an older series apart", () => {
    const rows = [night("a", "s0", false, "2026-12-01"), night("b", "s0", false, "2026-12-02")];
    expect(groupForProfessional(rows)).toEqual([
      { kind: "nuit", request: rows[0] },
      { kind: "nuit", request: rows[1] },
    ]);
  });
});
