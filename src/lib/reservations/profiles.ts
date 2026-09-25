import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import {
  db,
  professionalCommunes,
  professionalProfiles,
  users,
  type Experience,
  type Profession,
} from "@/db";
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
  specialisations: professionalProfiles.specialisations,
  experience: professionalProfiles.experience,
  bio: professionalProfiles.bio,
  nightRateEur: professionalProfiles.nightRateEur,
  photoId,
};

export type PublicProfile = {
  id: string;
  firstName: string;
  profession: Profession | null;
  specialisations: string[];
  experience: Experience | null;
  bio: string | null;
  nightRateEur: number | null;
  photoId: string | null;
  /** The communes she serves, by INS code. */
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
        isNull(users.suspendedAt),
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
