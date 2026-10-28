import "server-only";

import { and, eq } from "drizzle-orm";

import { careRequests, db, familyProfiles } from "@/db";
import { deletedAtExactly } from "@/lib/auth/suspension";
import { hasAddress } from "@/lib/reservations/rules";

import type { Address } from "./validation";

/**
 * The only module that names a request's address columns, `night_street`,
 * `night_house_number` and `night_box` (demande-adresse-de-la-nuit, D-15). A
 * test fails if any other file under `src/` names them. `src/lib/demandes/`
 * writes them by spreading `requestAddressValues` and never reads them:
 *
 * - `requestAddressValues` — the columns of an insert or an update.
 * - `nightAddressOf` — her request's own address, for a republished garde.
 * - `ownRequestAddress` — the address the edit form shows her.
 * - `requestHasAddress` — whether the night has a street and a number, never
 *   what they are: accepting an answer needs one (D-77).
 * - `deletionForgetsRequestAddresses` — a deletion's part.
 *
 * The reveal to the booked professional is `bookingAddress` in `profile.ts`.
 * A request published before the columns has none: each reader then takes
 * the profile's address, as before.
 */

/** The columns a request's address is written to. Null clears them. */
export function requestAddressValues(address: Address | null) {
  return {
    nightStreet: address?.street ?? null,
    nightHouseNumber: address?.houseNumber ?? null,
    nightBox: address?.box ?? null,
  };
}

const nightColumns = {
  street: careRequests.nightStreet,
  houseNumber: careRequests.nightHouseNumber,
  box: careRequests.nightBox,
};

const profileColumns = {
  street: familyProfiles.street,
  houseNumber: familyProfiles.houseNumber,
  box: familyProfiles.box,
};

function asAddress(row: { street: string | null; houseNumber: string | null; box: string | null } | null) {
  if (!row || !row.street || !row.houseNumber) return null;
  return { street: row.street, houseNumber: row.houseNumber, box: row.box };
}

/** Her request's night and her profile's address, for her own request only. */
async function bothAddresses(userId: string, requestId: string) {
  const [row] = await db
    .select({ night: nightColumns, profile: profileColumns })
    .from(careRequests)
    .leftJoin(familyProfiles, eq(familyProfiles.userId, careRequests.familyUserId))
    .where(and(eq(careRequests.id, requestId), eq(careRequests.familyUserId, userId)))
    .limit(1);
  return row ?? null;
}

/** The address stored on her request `requestId`, or null: none stored, or not hers. */
export async function nightAddressOf(userId: string, requestId: string): Promise<Address | null> {
  const row = await bothAddresses(userId, requestId);
  return asAddress(row?.night ?? null);
}

/** Her request's address, or her profile's for a request published before it had one. */
export async function ownRequestAddress(userId: string, requestId: string): Promise<Address | null> {
  const row = await bothAddresses(userId, requestId);
  if (!row) return null;
  return asAddress(row.night) ?? asAddress(row.profile);
}

/** Whether the night of her request has a street and a house number (D-77). Nothing else leaves. */
export async function requestHasAddress(userId: string, requestId: string): Promise<boolean> {
  const row = await bothAddresses(userId, requestId);
  if (!row) return false;
  return hasAddress(row.night) || hasAddress(row.profile);
}

/**
 * A deletion's part (back-office-admin, D-137): the address of each of her
 * requests goes, in the deletion's own batch and only if that batch deleted
 * her at `at`. Her requests keep their commune, as her profile's part says.
 */
export function deletionForgetsRequestAddresses(userId: string, at: Date) {
  return db
    .update(careRequests)
    .set(requestAddressValues(null))
    .where(and(eq(careRequests.familyUserId, userId), deletedAtExactly(userId, at)));
}
