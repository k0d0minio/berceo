import "server-only";

import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";

import { db, professionalAvailability, professionalProfiles, type ProfileStatus } from "@/db";

import { SHOWN_TO_FAMILIES, availabilityWindow, type NightWindow } from "./rules";

/**
 * Every read and write of `professional_availability`. The professional's own
 * functions take her user id from the session (the caller's `requireAccess`),
 * never from a form, and find her profile from it. Nothing about a care
 * request reads this module (D-12): availability filters nothing and blocks
 * nothing.
 */

export type OwnProfile = { id: string; status: ProfileStatus };

/** Her profile's id and status, or null before she has one. Never creates it. */
export async function ownProfile(userId: string): Promise<OwnProfile | null> {
  const [profile] = await db
    .select({ id: professionalProfiles.id, status: professionalProfiles.status })
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId))
    .limit(1);
  return profile ?? null;
}

/** The nights she marked inside the window, in date order. */
export async function markedNights(profileId: string, range: NightWindow): Promise<string[]> {
  const rows = await db
    .select({ nightDate: professionalAvailability.nightDate })
    .from(professionalAvailability)
    .where(
      and(
        eq(professionalAvailability.profileId, profileId),
        gte(professionalAvailability.nightDate, range.first),
        lte(professionalAvailability.nightDate, range.last),
      ),
    )
    .orderBy(asc(professionalAvailability.nightDate));
  return rows.map((row) => row.nightDate);
}

/**
 * Marks (« Disponible ») or clears (« Indisponible ») validated dates on her
 * profile. Marking a marked night and clearing an unmarked one change nothing.
 */
export async function setNights(
  profileId: string,
  dates: readonly string[],
  available: boolean,
): Promise<void> {
  if (available) {
    await db
      .insert(professionalAvailability)
      .values(dates.map((nightDate) => ({ profileId, nightDate })))
      .onConflictDoNothing();
    return;
  }
  await db
    .delete(professionalAvailability)
    .where(
      and(
        eq(professionalAvailability.profileId, profileId),
        inArray(professionalAvailability.nightDate, [...dates]),
      ),
    );
}

/**
 * « Prochaines disponibilités »: at most five marked nights from tonight to
 * the end of the window, in date order, and none for a profile that is not
 * validated (only a validated profile is ever shown to a family, D-21). The
 * read candidature-et-reservation and recherche-et-fiches-publiques call.
 */
export async function nextAvailableNights(profileId: string, now: Date): Promise<string[]> {
  const range = availabilityWindow(now);
  const rows = await db
    .select({ nightDate: professionalAvailability.nightDate })
    .from(professionalAvailability)
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, professionalAvailability.profileId))
    .where(
      and(
        eq(professionalAvailability.profileId, profileId),
        eq(professionalProfiles.status, "valide"),
        gte(professionalAvailability.nightDate, range.first),
        lte(professionalAvailability.nightDate, range.last),
      ),
    )
    .orderBy(asc(professionalAvailability.nightDate))
    .limit(SHOWN_TO_FAMILIES);
  return rows.map((row) => row.nightDate);
}
