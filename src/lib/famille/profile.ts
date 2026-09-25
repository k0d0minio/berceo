import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { bookings, careRequests, db, familyProfiles, professionalProfiles, users } from "@/db";
import { findLocality, type Locality } from "@/lib/communes";
import { NIGHT_HOURS, TIME_ZONE } from "@/lib/demandes/rules";
import { hasAddress } from "@/lib/reservations/rules";

import type { ProfileValues } from "./validation";

/**
 * The only module that reads `family_profiles` (D-15). A test fails if any
 * other file under `src/` names the table, so the family's address can only
 * leave the database through a function declared here:
 *
 * - `ownFamilyProfile` — everything, for the family's own profile page.
 * - `familyCommune` — the commune only, for everything else (the space's home
 *   today; a request's commune and the search later).
 * - `familyHasAddress` — whether she gave a street and a number, never what
 *   they are: accepting an answer needs one (D-77).
 * - `bookingAddress` — the address of a confirmed booking, for the
 *   professional booked and nobody else, read live from the profile (D-15,
 *   D-77): a booking never holds a copy.
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

/** Whether her profile holds a street and a house number (D-77). Nothing else leaves. */
export async function familyHasAddress(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ street: familyProfiles.street, houseNumber: familyProfiles.houseNumber })
    .from(familyProfiles)
    .where(eq(familyProfiles.userId, userId))
    .limit(1);
  return hasAddress(row ?? null);
}

export type BookingAddress = {
  street: string | null;
  houseNumber: string | null;
  box: string | null;
  postcode: string;
  locality: string;
};

/** The columns `bookingAddress` selects: the address and its place, never the context line. */
export const bookingAddressColumns = {
  street: familyProfiles.street,
  houseNumber: familyProfiles.houseNumber,
  box: familyProfiles.box,
  postcode: familyProfiles.postcode,
  locality: familyProfiles.locality,
};

/**
 * The family's address for the booking `bookingId`, only when the professional
 * whose user id is `professionalUserId` is the one booked, and only on a
 * confirmed garde whose night has not ended (D-110, `isAddressVisible` in
 * `src/lib/gardes/rules.ts`). Anyone else, a cancelled or finished garde, and
 * an unknown booking read null: the booking's own ownership is the gate.
 */
export async function bookingAddress(
  bookingId: string,
  professionalUserId: string,
): Promise<BookingAddress | null> {
  const [row] = await db
    .select(bookingAddressColumns)
    .from(bookings)
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
    .innerJoin(familyProfiles, eq(familyProfiles.userId, bookings.familyUserId))
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .where(
      and(
        eq(bookings.id, bookingId),
        eq(professionalProfiles.userId, professionalUserId),
        eq(bookings.status, "confirmee"),
        sql`(${careRequests.nightDate} + ${careRequests.startTime} + make_interval(hours => ${NIGHT_HOURS}::int)) > (now() AT TIME ZONE ${TIME_ZONE})`,
      ),
    )
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
