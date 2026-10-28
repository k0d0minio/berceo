import "server-only";

import { and, asc, eq, exists, inArray, or, sql } from "drizzle-orm";

import { db, professionalCommunes, professionalProfiles, professionalReach, users, type Profession } from "@/db";
import { NO_NOTE, notesOfProfiles, type Note } from "@/lib/avis/ratings";
import { nextAvailableNights } from "@/lib/disponibilites/nights";
import { notSuspended } from "@/lib/auth/suspension";
import { photoId } from "@/lib/reservations/answers";

import { orderProfessionals } from "./rules";

/**
 * The search's only reads (D-11, D-14): the validated professionals reaching a
 * set of communes, and one validated professional's teaser by her short id.
 * `teaserColumns` is the whole list of what leaves for a public page (her
 * « Formations complémentaires » among it, onboarding-retour-1), and
 * `cardColumns` adds her photo for a signed-in family: never her surname,
 * e-mail, phone, INAMI number, rate, documents or declarations (the tests hold
 * both lists). Only a `valide` profile of an account that is not suspended
 * exists here; anything else reads as unknown (D-75, D-134). The note comes from `src/lib/avis/`, the nights from
 * `src/lib/disponibilites/`; this module computes neither.
 */

export const teaserColumns = {
  id: professionalProfiles.id,
  firstName: users.firstName,
  profession: professionalProfiles.profession,
  bio: professionalProfiles.bio,
  formationsComplementaires: professionalProfiles.formationsComplementaires,
  // Her radius and « Toute la Belgique » (zone-rayon-lecture): they tell nothing private.
  zoneRadiusKm: professionalProfiles.zoneRadiusKm,
  zoneWholeBelgium: professionalProfiles.zoneWholeBelgium,
};

export const cardColumns = { ...teaserColumns, photoId };

/** A public teaser: what a signed-out visitor may read of her. */
export type Teaser = {
  id: string;
  firstName: string;
  profession: Profession | null;
  bio: string | null;
  formationsComplementaires: string | null;
  /** Her radius in km around her communes: 0 is her communes only. */
  zoneRadiusKm: number;
  zoneWholeBelgium: boolean;
  /** The communes she chose, by REFNIS code: never the ones her radius reaches. */
  communes: string[];
  note: Note;
  /** Her soonest indicative night, for the order only (D-123); never shown on a public page. */
  nextNight: string | null;
};

/** A signed-in family's card: the teaser, her photo and her next nights. */
export type Card = Teaser & { photoId: string | null; nights: string[] };

// Validated and not suspended (D-134): a suspended professional reads as unknown too.
const isValid = and(eq(professionalProfiles.status, "valide"), notSuspended(professionalProfiles.userId));

async function communesOf(profileIds: readonly string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>(profileIds.map((id) => [id, []]));
  if (profileIds.length === 0) return map;
  const rows = await db
    .select({ profileId: professionalCommunes.profileId, ins: professionalCommunes.communeIns })
    .from(professionalCommunes)
    .where(inArray(professionalCommunes.profileId, [...profileIds]));
  for (const row of rows) map.get(row.profileId)?.push(row.ins);
  return map;
}

/**
 * The query for the validated professionals reaching any of these communes
 * (exported for its test): « Toute la Belgique », or a commune of her reach,
 * her radius around her communes (zone-rayon-lecture).
 */
export function servingQuery(ins: readonly string[]) {
  // One row per profile: the reach is read in an EXISTS.
  return db
    .select({ id: professionalProfiles.id })
    .from(professionalProfiles)
    .where(
      and(
        isValid,
        or(
          eq(professionalProfiles.zoneWholeBelgium, true),
          exists(
            db
              .select({ ins: professionalReach.communeIns })
              .from(professionalReach)
              .where(
                and(
                  eq(professionalReach.profileId, professionalProfiles.id),
                  inArray(professionalReach.communeIns, [...ins]),
                ),
              ),
          ),
        ),
      ),
    );
}

/** The ids of the validated professionals reaching any of these communes, once each. */
async function servingIds(ins: readonly string[]): Promise<string[]> {
  if (ins.length === 0) return [];
  const rows = await servingQuery(ins);
  return rows.map((row) => row.id);
}

/** The query for the validated profile a short id names, two rows at most (exported for its test). */
export function shortIdQuery(id8: string) {
  return db
    .select(teaserColumns)
    .from(professionalProfiles)
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .where(and(sql`${professionalProfiles.id}::text like ${`${id8}%`}`, isValid))
    .limit(2);
}

/** Notes, communes and nights for a set of rows, in the search order. */
async function complete<R extends { id: string; firstName: string }>(
  rows: readonly R[],
  now: Date,
): Promise<(R & { communes: string[]; note: Note; nights: string[]; nextNight: string | null })[]> {
  const ids = rows.map((row) => row.id);
  const [notes, communes, nights] = await Promise.all([
    notesOfProfiles(ids),
    communesOf(ids),
    Promise.all(ids.map((id) => nextAvailableNights(id, now))),
  ]);
  return orderProfessionals(
    rows.map((row, i) => ({
      ...row,
      communes: communes.get(row.id) ?? [],
      note: notes.get(row.id) ?? { ...NO_NOTE },
      nights: nights[i],
      nextNight: nights[i][0] ?? null,
    })),
  );
}

/** A public teaser from a completed row: the listed fields and nothing else. */
function teaserOf(row: Teaser): Teaser {
  return {
    id: row.id,
    firstName: row.firstName,
    profession: row.profession,
    bio: row.bio,
    formationsComplementaires: row.formationsComplementaires,
    zoneRadiusKm: row.zoneRadiusKm,
    zoneWholeBelgium: row.zoneWholeBelgium,
    communes: row.communes,
    note: row.note,
    nextNight: row.nextNight,
  };
}

/** The signed-in search's cards, for the communes the query resolved to. */
export async function cardsServing(ins: readonly string[], now: Date): Promise<Card[]> {
  const ids = await servingIds(ins);
  if (ids.length === 0) return [];
  const rows = await db
    .select(cardColumns)
    .from(professionalProfiles)
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .where(and(inArray(professionalProfiles.id, ids), isValid));
  return complete(rows, now);
}

/** A commune page's teasers: no photo, and the nights only order them (D-123, D-126). */
export async function teasersServing(ins: string, now: Date): Promise<Teaser[]> {
  const ids = await servingIds([ins]);
  if (ids.length === 0) return [];
  const rows = await db
    .select(teaserColumns)
    .from(professionalProfiles)
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .where(and(inArray(professionalProfiles.id, ids), isValid));
  return (await complete(rows, now)).map(teaserOf);
}

/**
 * The validated professional a public slug's short id names, or null when
 * none does, when several do (D-125), or when she is no longer validated.
 */
export async function teaserByShortId(id8: string, now: Date): Promise<Teaser | null> {
  if (!/^[0-9a-f]{8}$/.test(id8)) return null;
  const rows = await shortIdQuery(id8);
  if (rows.length !== 1) return null;
  const [teaser] = await complete(rows, now);
  return teaserOf(teaser);
}

/** Every validated professional's first name and id, for the sitemap. */
export async function validProfessionals(): Promise<{ id: string; firstName: string }[]> {
  return db
    .select({ id: professionalProfiles.id, firstName: users.firstName })
    .from(professionalProfiles)
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .where(isValid)
    .orderBy(asc(professionalProfiles.id));
}
