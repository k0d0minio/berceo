import { describe, expect, it } from "vitest";

import { isCronRequest, purgeRefusedFiles, type DueProfile, type PurgeDeps } from "./purge";
import { isPurgeDue } from "./rules";

/*
 * Written from the spec's acceptance criteria (verification-back-office): the
 * purge deletes every file of each profile refused more than 30 days ago,
 * leaves the others, writes one journal entry per purged profile, and a second
 * call deletes nothing. The route answers only the cron's secret.
 */

const NOW = new Date("2026-11-30T03:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

type Row = { profileId: string; userId: string; status: "refuse" | "valide"; reviewedAt: Date };

/** A bucket, a documents table and a journal in memory. */
function world(rows: Row[], files: Record<string, string[]>) {
  const bucket = new Set(Object.values(files).flat());
  const table = new Map(Object.entries(files).map(([id, keys]) => [id, [...keys]]));
  const journal: { profileId: string; at: Date }[] = [];

  const deps: PurgeDeps = {
    now: () => NOW,
    due: async (cutoff) =>
      rows
        // The SQL selection: refused, refusal before the cutoff, files left.
        .filter((r) => r.status === "refuse" && r.reviewedAt < cutoff && (table.get(r.profileId)?.length ?? 0) > 0)
        .map<DueProfile>((r) => ({
          profileId: r.profileId,
          userId: r.userId,
          name: r.profileId,
          files: (table.get(r.profileId) ?? []).map((key) => ({ id: key, storageKey: key })),
        })),
    deleteObject: async (key) => {
      bucket.delete(key);
    },
    forget: async (profile, at) => {
      table.set(profile.profileId, []);
      journal.push({ profileId: profile.profileId, at });
    },
  };
  return { deps, bucket, table, journal };
}

const rows: Row[] = [
  { profileId: "old", userId: "u1", status: "refuse", reviewedAt: daysAgo(31) },
  { profileId: "recent", userId: "u2", status: "refuse", reviewedAt: daysAgo(10) },
  { profileId: "validated", userId: "u3", status: "valide", reviewedAt: daysAgo(90) },
];
const files = {
  old: ["profils/old/a", "profils/old/photo"],
  recent: ["profils/recent/a"],
  validated: ["profils/validated/a"],
};

describe("the purge of refused files", () => {
  it("deletes every file of a profile refused more than 30 days ago, photo included", async () => {
    const w = world(rows, files);
    const report = await purgeRefusedFiles(w.deps);

    expect(report).toEqual({ profiles: 1, files: 2, failed: 0 });
    expect(w.bucket.has("profils/old/a")).toBe(false);
    expect(w.bucket.has("profils/old/photo")).toBe(false);
    expect(w.table.get("old")).toEqual([]);
  });

  it("leaves a profile refused less than 30 days ago, and any profile not refused", async () => {
    const w = world(rows, files);
    await purgeRefusedFiles(w.deps);

    expect(w.bucket.has("profils/recent/a")).toBe(true);
    expect(w.bucket.has("profils/validated/a")).toBe(true);
    expect(w.table.get("recent")).toEqual(["profils/recent/a"]);
  });

  it("writes one journal entry per purged profile", async () => {
    const w = world(rows, files);
    await purgeRefusedFiles(w.deps);

    expect(w.journal).toEqual([{ profileId: "old", at: NOW }]);
  });

  it("deletes nothing on a second call", async () => {
    const w = world(rows, files);
    await purgeRefusedFiles(w.deps);
    const second = await purgeRefusedFiles(w.deps);

    expect(second).toEqual({ profiles: 0, files: 0, failed: 0 });
    expect(w.journal).toHaveLength(1);
  });

  it("keeps the rows and writes no entry when an object cannot be deleted, so the next run retries", async () => {
    const w = world(rows, files);
    const report = await purgeRefusedFiles({
      ...w.deps,
      deleteObject: async () => {
        throw new Error("bucket unavailable");
      },
    });

    expect(report).toEqual({ profiles: 0, files: 0, failed: 1 });
    expect(w.table.get("old")).toEqual(["profils/old/a", "profils/old/photo"]);
    expect(w.journal).toHaveLength(0);
  });

  it("selects the same profiles as the rule", () => {
    for (const row of rows) {
      expect(isPurgeDue(row, NOW)).toBe(row.profileId === "old");
    }
  });
});

describe("the cron's secret", () => {
  const secret = "s".repeat(32);

  it("accepts only the bearer of the configured secret", () => {
    expect(isCronRequest(`Bearer ${secret}`, secret)).toBe(true);
    expect(isCronRequest(`Bearer ${"t".repeat(32)}`, secret)).toBe(false);
    expect(isCronRequest(secret, secret)).toBe(false);
    expect(isCronRequest(null, secret)).toBe(false);
  });

  it("accepts nothing when no secret is configured", () => {
    expect(isCronRequest("Bearer ", undefined)).toBe(false);
    expect(isCronRequest("Bearer ", "")).toBe(false);
    expect(isCronRequest("Bearer short", "short")).toBe(false);
  });
});
