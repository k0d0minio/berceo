import "server-only";

import { eq } from "drizzle-orm";

import { db, familyProfiles, users } from "@/db";
import { findLocality, type Locality } from "@/lib/communes";

import type { ProfileValues } from "./validation";

/**
 * The only module that reads `family_profiles` (D-15). A test fails if any
 * other file under `src/` names the table, so the family's address can only
 * leave the database through a function declared here:
 *
 * - `ownFamilyProfile` — everything, for the family's own profile page.
 * - `familyCommune` — the commune only, for everything else (the space's home
 *   today; a request's commune and the search later).
 *
 * Revealing the address to a professional once a booking is confirmed is
 * candidature-et-reservation's; it adds its reader here.
 */

export type OwnFamilyProfile = {
  locality: Locality | null;
  street: string | null;
  houseNumber: string | null;
  box: string | null;
  context: string | null;
};

export type FamilyCommune = { ins: string; postcode: string; locality: string };

/** The columns `familyCommune` selects. No address column, ever: the tests hold it. */
export const communeColumns = {
  ins: familyProfiles.communeIns,
  postcode: familyProfiles.postcode,
  locality: familyProfiles.locality,
};

/** The family's whole profile, for her own page only. Null before the first save. */
export async function ownFamilyProfile(userId: string): Promise<OwnFamilyProfile | null> {
  const [row] = await db
    .select()
    .from(familyProfiles)
    .where(eq(familyProfiles.userId, userId))
    .limit(1);
  if (!row) return null;

  return {
    // A locality the list no longer carries (a later merger) reads as unset, so
    // the form asks for it again rather than posting a value it would refuse.
    locality: findLocality(row.postcode, row.locality),
    street: row.street,
    houseNumber: row.houseNumber,
    box: row.box,
    context: row.context,
  };
}

/** The family's commune, without her address. Null while she has not saved one. */
export async function familyCommune(userId: string): Promise<FamilyCommune | null> {
  const [row] = await db
    .select(communeColumns)
    .from(familyProfiles)
    .where(eq(familyProfiles.userId, userId))
    .limit(1);
  return row ?? null;
}

/**
 * Saves the profile of the user `userId` — always the signed-in parent's id,
 * taken from the session by the caller, never from the form. The users row and
 * the profile row are written in one batch.
 */
export async function saveFamilyProfile(userId: string, values: ProfileValues): Promise<void> {
  const now = new Date();
  const profile = {
    communeIns: values.locality.ins,
    postcode: values.locality.postcode,
    locality: values.locality.locality,
    street: values.street,
    houseNumber: values.houseNumber,
    box: values.box,
    context: values.context,
    updatedAt: now,
  };

  await db.batch([
    db
      .update(users)
      .set({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        updatedAt: now,
      })
      .where(eq(users.id, userId)),
    db
      .insert(familyProfiles)
      .values({ userId, ...profile })
      .onConflictDoUpdate({ target: familyProfiles.userId, set: profile }),
  ]);
}
