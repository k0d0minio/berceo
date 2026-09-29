/**
 * Removes a professional's files (onboarding-orphaned-objects): each object
 * leaves the bucket before its `professional_documents` row, and a row goes
 * only once its own object is gone. A failed object delete keeps the row, so
 * the purge of refused files (D-41, D-55) and the account deletion (D-137),
 * which start from the rows, still find the file; the next try is safe, since
 * deleting an object that is already gone is not an error. The steps are
 * injected, as in `src/lib/admin/purge.ts`, so the tests hold the order
 * without a bucket or a database; the actions wire the real ones.
 */

export type RemovableFile = { id: string; storageKey: string };

export type RemovalDeps = {
  deleteObject: (key: string) => Promise<void>;
  /** Deletes the rows with these ids, in one statement. */
  deleteRows: (ids: string[]) => Promise<void>;
};

export type RemovalReport = { removed: string[]; failed: string[] };

export async function removeFiles(files: RemovableFile[], deps: RemovalDeps): Promise<RemovalReport> {
  if (files.length === 0) return { removed: [], failed: [] };

  const objects = await Promise.allSettled(files.map((f) => deps.deleteObject(f.storageKey)));
  const gone: string[] = [];
  const failed: string[] = [];
  objects.forEach((outcome, i) => {
    if (outcome.status === "fulfilled") {
      gone.push(files[i].id);
    } else {
      // The row stays: the file is still hers, and still found by the purge.
      console.error("[onboarding] file object not deleted", { id: files[i].id, error: outcome.reason });
      failed.push(files[i].id);
    }
  });
  if (gone.length === 0) return { removed: [], failed };

  try {
    await deps.deleteRows(gone);
  } catch (error) {
    // The objects are gone but the rows stay: visible, and removed on the next try.
    console.error("[onboarding] file rows not deleted", { ids: gone, error });
    return { removed: [], failed: [...failed, ...gone] };
  }
  return { removed: gone, failed };
}
