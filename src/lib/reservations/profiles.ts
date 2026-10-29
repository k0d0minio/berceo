import "server-only";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import {
  db,
  professionalCommunes,
  professionalProfiles,
  users,
  type Profession,
} from "@/db";
import { notSuspended } from "@/lib/auth/suspension";
import { notesOfProfiles, NO_NOTE, type Note } from "@/lib/avis/ratings";
import { UUID } from "@/lib/demandes/requests";

import { photoId } from "./answers";

/**
 * A professional's full profile as a family reads it (D-3, D-75): any
 * signed-in family, any validated profile. `profileColumns` is the whole list
 * of what leaves: never her surname, e-mail, phone, INAMI number or documents;
 * the tests hold it.
 */

export const profileColumns = {
  id: professionalProfiles.id,
  firstName: users.firstName,
  profession: professionalProfiles.profession,
  formationsComplementaires: professionalProfiles.formationsComplementaires,
  bio: professionalProfiles.bio,
  nightRateEur: professionalProfiles.nightRateEur,
  extraHourRateEur: professionalProfiles.extraHourRateEur,
  // Her radius and « Toute la Belgique » (zone-rayon-lecture), shown in one line.
  zoneRadiusKm: professionalProfiles.zoneRadiusKm,
  zoneWholeBelgium: professionalProfiles.zoneWholeBelgium,
  photoId,
};

export type PublicProfile = {
  id: string;
  firstName: string;
  profession: Profession | null;
  formationsComplementaires: string | null;
  bio: string | null;
  nightRateEur: number | null;
  extraHourRateEur: number | null;
  photoId: string | null;
  zoneRadiusKm: number;
  zoneWholeBelgium: boolean;
  /** The communes she chose, by INS code: never the ones her radius reaches. */
  communes: string[];
  /** Her note and gardes count (avis-etoiles, D-119), read by `src/lib/avis/`. */
  note: Note;
};

/**
 * A validated professional's profile, or null: any other status, or a
 * suspended account, reads as unknown (D-75, D-134).
 */
export async function publicProfile(profileId: string): Promise<PublicProfile | null> {
  if (!UUID.test(profileId)) return null;
  const [row] = await db
    .select(profileColumns)
    .from(professionalProfiles)
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .where(
      and(
        eq(professionalProfiles.id, profileId),
        eq(professionalProfiles.status, "valide"),
        notSuspended(professionalProfiles.userId),
      ),
    )
    .limit(1);
  if (!row) return null;

  const [communes, notes] = await Promise.all([
    db
      .select({ ins: professionalCommunes.communeIns })
      .from(professionalCommunes)
      .where(eq(professionalCommunes.profileId, profileId)),
    notesOfProfiles([profileId]),
  ]);
  return { ...row, communes: communes.map((c) => c.ins), note: notes.get(profileId) ?? NO_NOTE };
}

/** What « Mes professionnelles » reads of each card (favoris-liste): a subset of `profileColumns`, the test holds it. */
export const listColumns = {
  id: profileColumns.id,
  firstName: profileColumns.firstName,
  profession: profileColumns.profession,
  photoId: profileColumns.photoId,
};

export type ListedProfile = {
  id: string;
  firstName: string;
  profession: Profession | null;
  photoId: string | null;
  /** A `valide` profile of an account that is not suspended: the one state that takes a request. */
  available: boolean;
  note: Note;
};

/**
 * The profiles a family's list names, by id (favoris-liste). A deleted account
 * is shown to no one (D-136), so its profile is absent. Any other profile
 * is here, `available` or not: the list shows an unavailable one as such.
 */
export async function listedProfiles(profileIds: readonly string[]): Promise<Map<string, ListedProfile>> {
  const ids = profileIds.filter((id) => UUID.test(id));
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({
      ...listColumns,
      available: sql<boolean>`(${professionalProfiles.status} = 'valide' and ${notSuspended(professionalProfiles.userId)})`,
    })
    .from(professionalProfiles)
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .where(and(inArray(professionalProfiles.id, ids), isNull(users.deletedAt)));
  const notes = await notesOfProfiles(rows.map((row) => row.id));
  return new Map(
    rows.map((row) => [row.id, { ...row, available: row.available === true, note: notes.get(row.id) ?? NO_NOTE }]),
  );
}
