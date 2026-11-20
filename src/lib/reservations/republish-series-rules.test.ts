import { describe, expect, it } from "vitest";

import { canRepublishSeries, republishSeriesResult, type SeriesNightFacts } from "./republish-series-rules";

/**
 * Spec (JAM-353): « Republier ma demande » is offered on an open regular
 * request with one waiting answer or more (criterion 1), and never on a
 * request with a booked night (criterion 4). Written from the acceptance
 * criteria. The SQL that holds the same rule is in
 * `republish-series.test.ts`.
 */

// 25 September 2026, 12:00 in Brussels (CEST).
const NOON = new Date("2026-09-25T10:00:00Z");

const night = (nightDate: string, status: SeriesNightFacts["status"] = "ouverte"): SeriesNightFacts => ({
  status,
  nightDate,
  startTime: "20:00:00",
});

describe("when a regular request can be republished", () => {
  it("is offered with one waiting answer on open nights ahead", () => {
    expect(canRepublishSeries([night("2026-09-30"), night("2026-10-07")], 1, NOON)).toBe(true);
  });

  it("is offered with more than one waiting answer", () => {
    expect(canRepublishSeries([night("2026-09-30"), night("2026-10-07")], 4, NOON)).toBe(true);
  });

  it("is not offered with no waiting answer", () => {
    expect(canRepublishSeries([night("2026-09-30"), night("2026-10-07")], 0, NOON)).toBe(false);
  });

  it("is not offered when a night is booked, whatever waits on the other nights", () => {
    expect(canRepublishSeries([night("2026-09-30", "attribuee"), night("2026-10-07")], 2, NOON)).toBe(false);
  });

  it("is not offered when each night is cancelled", () => {
    expect(canRepublishSeries([night("2026-09-30", "annulee"), night("2026-10-07", "annulee")], 1, NOON)).toBe(false);
  });

  it("is not offered when each open night has started", () => {
    expect(canRepublishSeries([night("2026-09-20"), night("2026-09-24")], 1, NOON)).toBe(false);
  });

  it("is offered while one open night is ahead, with nights that are past or cancelled", () => {
    const nights = [night("2026-09-20"), night("2026-09-27", "annulee"), night("2026-10-07")];
    expect(canRepublishSeries(nights, 1, NOON)).toBe(true);
  });

  it("is not offered on a request with no night", () => {
    expect(canRepublishSeries([], 1, NOON)).toBe(false);
  });
});

describe("the result of a republication", () => {
  it("is a refusal when no night was marked, and names no answer", () => {
    expect(republishSeriesResult([], [])).toEqual({ ok: false });
    expect(republishSeriesResult([], [{ id: "a-1" }])).toEqual({ ok: false });
  });

  it("gives each declined answer of each marked night", () => {
    expect(republishSeriesResult([{ id: "n-1" }, { id: "n-2" }], [{ id: "a-1" }, { id: "a-2" }, { id: "a-3" }])).toEqual({
      ok: true,
      declined: ["a-1", "a-2", "a-3"],
    });
  });

  it("is a republication with no declined answer when the answers left between the two statements", () => {
    expect(republishSeriesResult([{ id: "n-1" }], [])).toEqual({ ok: true, declined: [] });
  });
});
