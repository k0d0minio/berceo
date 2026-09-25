import "server-only";

import { and, asc, eq, inArray, sql } from "drizzle-orm";

import { db, professionalCommunes, professionalProfiles, users, type Profession } from "@/db";
import { NO_NOTE, notesOfProfiles, type Note } from "@/lib/avis/ratings";
import { nextAvailableNights } from "@/lib/disponibilites/nights";
import { photoId } from "@/lib/reservations/answers";

import { orderProfessionals } from "./rules";

/**
 * The search's only reads (D-11, D-14): the validated professionals serving a
 * set of communes, and one validated professional's teaser by her short id.
 * `teaserColumns` is the whole list of what leaves for a public page, and
 * `cardColumns` adds her photo for a signed-in family: never her surname,
 * e-mail, phone, INAMI number, rate, documents or declarations (the tests hold
 * both lists). Only a `valide` profile exists here; any other status reads as
 * unknown (D-75). The note comes from `src/lib/avis/`, the nights from
 * `src/lib/disponibilites/`; this module computes neither.
 */

export const teaserColumns = {
  id: professionalProfiles.id,
  firstName: users.firstName,
  profession: professionalProfiles.profession,
  bio: professionalProfiles.bio,
};

export const cardColumns = { ...teaserColumns, photoId };

/** A public teaser: what a signed-out visitor may read of her. */
export type Teaser = {
  id: string;
  firstName: string;
  profession: Profession | null;
  bio: string | null;
  /** The communes she serves, by REFNIS code. */
  communes: string[];
  note: Note;
  /** Her soonest indicative night, for the order only (D-123); never shown on a public page. */
  nextNight: string | null;
};

/** A signed-in family's card: the teaser, her photo and her next nights. */
export type Card = Teaser & { photoId: string | null; nights: string[] };

const isValid = eq(professionalProfiles.status, "valide");

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

/** The query for the validated professionals serving any of these communes (exported for its test). */
export function servingQuery(ins: readonly string[]) {
  return db
    .selectDistinct({ id: professionalProfiles.id })
    .from(professionalCommunes)
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, professionalCommunes.profileId))
    .where(and(inArray(professionalCommunes.communeIns, [...ins]), isValid));
}

/** The ids of the validated professionals serving any of these communes, once each. */
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
