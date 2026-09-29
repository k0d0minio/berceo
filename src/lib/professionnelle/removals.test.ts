import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { removeFiles, type RemovableFile, type RemovalDeps } from "./removals";

/*
 * Written from the spec's acceptance criteria (onboarding-orphaned-objects):
 * the object leaves the bucket before its row; an object that cannot be
 * deleted keeps its row and is reported not removed; with several files only
 * the rows of the objects that went are deleted; a row delete that fails after
 * the objects went reports the files not removed; a file whose object is
 * already gone still loses its row.
 */

/** A bucket and a documents table in memory, with every call recorded in order. */
function world(files: RemovableFile[], failing: { objects?: string[]; rows?: boolean } = {}) {
  const bucket = new Set(files.map((f) => f.storageKey));
  const table = new Set(files.map((f) => f.id));
  const calls: string[] = [];

  const deps: RemovalDeps = {
    deleteObject: async (key) => {
      calls.push(`object:${key}`);
      if (failing.objects?.includes(key)) throw new Error("store unreachable");
      // Deleting an object that is already gone is not an error.
      bucket.delete(key);
    },
    deleteRows: async (ids) => {
      calls.push(`rows:${ids.join(",")}`);
      if (failing.rows) throw new Error("database unreachable");
      for (const id of ids) table.delete(id);
    },
  };
  return { deps, bucket, table, calls };
}

const diplome = { id: "d1", storageKey: "profils/p/d1" };
const attestation = { id: "a1", storageKey: "profils/p/a1" };
const photo = { id: "ph", storageKey: "profils/p/ph" };

describe("removing a professional's files", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deletes the object before its row", async () => {
    const w = world([diplome]);
    const report = await removeFiles([diplome], w.deps);

    expect(w.calls).toEqual(["object:profils/p/d1", "rows:d1"]);
    expect(report).toEqual({ removed: ["d1"], failed: [] });
    expect(w.bucket.size).toBe(0);
    expect(w.table.size).toBe(0);
  });

  it("keeps the row of a file whose object cannot be deleted, and reports it not removed", async () => {
    const w = world([diplome], { objects: [diplome.storageKey] });
    const report = await removeFiles([diplome], w.deps);

    expect(report).toEqual({ removed: [], failed: ["d1"] });
    expect(w.table.has("d1")).toBe(true);
    expect(w.calls.some((c) => c.startsWith("rows:"))).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it("with several files and one object failure, deletes only the other files' rows", async () => {
    const all = [diplome, attestation, photo];
    const w = world(all, { objects: [attestation.storageKey] });
    const report = await removeFiles(all, w.deps);

    expect(report.removed.sort()).toEqual(["d1", "ph"]);
    expect(report.failed).toEqual(["a1"]);
    expect([...w.table]).toEqual(["a1"]);
    expect([...w.bucket]).toEqual([attestation.storageKey]);
    // Every object was tried before any row was touched.
    expect(w.calls.findIndex((c) => c.startsWith("rows:"))).toBe(3);
  });

  it("reports the files not removed when the rows cannot be deleted after their objects went", async () => {
    const all = [diplome, photo];
    const w = world(all, { rows: true });
    const report = await removeFiles(all, w.deps);

    expect(report.removed).toEqual([]);
    expect(report.failed.sort()).toEqual(["d1", "ph"]);
    expect(w.table.size).toBe(2);
    expect(w.bucket.size).toBe(0);
    expect(console.error).toHaveBeenCalled();
  });

  it("deletes the row of a file whose object is already gone, so a retry finishes the removal", async () => {
    const w = world([diplome], { rows: true });
    await removeFiles([diplome], w.deps);
    expect(w.bucket.has(diplome.storageKey)).toBe(false);
    expect(w.table.has("d1")).toBe(true);

    // The database is back: the retry deletes the missing object without error, then the row.
    const retry: RemovalDeps = {
      deleteObject: w.deps.deleteObject,
      deleteRows: async (ids) => {
        for (const id of ids) w.table.delete(id);
      },
    };
    const report = await removeFiles([diplome], retry);
    expect(report).toEqual({ removed: ["d1"], failed: [] });
    expect(w.table.size).toBe(0);
  });

  it("does nothing for no files", async () => {
    const w = world([]);
    expect(await removeFiles([], w.deps)).toEqual({ removed: [], failed: [] });
    expect(w.calls).toEqual([]);
  });
});
