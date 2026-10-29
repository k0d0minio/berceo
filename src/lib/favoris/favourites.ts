import "server-only";

import { and, eq, inArray, or } from "drizzle-orm";

import { db, favourites, professionalProfiles } from "@/db";
import { deletedAtExactly } from "@/lib/auth/suspension";

/**
 * Every read and write of `favourites` (favoris-marquer). The family's id
 * comes from the session (the caller's `requireAccess`), never from a form.
 * The caller checks the subscription's gate and that the profile is
 * validated before a mark. A mark is hers alone: no page of the professional
 * and no page of the founders imports this module (`isolation.test.ts`).
 */

/** The profiles among `profileIds` that the family marked. */
export async function markedAmong(familyUserId: string, profileIds: readonly string[]): Promise<Set<string>> {
  if (profileIds.length === 0) return new Set();
  const rows = await db
    .select({ profileId: favourites.profileId })
    .from(favourites)
    .where(and(eq(favourites.familyUserId, familyUserId), inArray(favourites.profileId, [...profileIds])));
  return new Set(rows.map((row) => row.profileId));
}

/** Whether the family marked this profile. */
export async function isMarked(familyUserId: string, profileId: string): Promise<boolean> {
  return (await markedAmong(familyUserId, [profileId])).has(profileId);
}

/** Marks or unmarks a profile. Marking a marked profile and unmarking an unmarked one change nothing. */
export async function setMark(familyUserId: string, profileId: string, marked: boolean): Promise<void> {
  if (marked) {
    await db.insert(favourites).values({ familyUserId, profileId }).onConflictDoNothing();
    return;
  }
  await db
    .delete(favourites)
    .where(and(eq(favourites.familyUserId, familyUserId), eq(favourites.profileId, profileId)));
}

/**
 * A deletion's part here (back-office-admin, D-137): a family's marks, and
 * every mark on a professional's profile, go in the deletion's own batch and
 * only if that batch deleted the account at `at`.
 */
export function deletionForgetsFavourites(userId: string, at: Date) {
  return db
    .delete(favourites)
    .where(
      and(
        or(
          eq(favourites.familyUserId, userId),
          inArray(
            favourites.profileId,
            db
              .select({ id: professionalProfiles.id })
              .from(professionalProfiles)
              .where(eq(professionalProfiles.userId, userId)),
          ),
        ),
        deletedAtExactly(userId, at),
      ),
    );
}
