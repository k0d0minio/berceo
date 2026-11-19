import type { AgeUnit, Children } from "./rules";

/**
 * Regular nights (demande-nuits-regulieres) are one request per night with a
 * shared series id. The family's list and the digest show a series as one
 * entry: these group the rows. Pure, so the tests hold the grouping.
 */

/** One entry of « Mes demandes »: a one-off night, or the nights of one series. */
export type ListEntry<T> = { kind: "nuit"; request: T } | { kind: "serie"; seriesId: string; requests: T[] };

/**
 * Groups `rows` as « Mes demandes » shows them: a series takes the place of
 * its first night in `rows`, its nights in date order. A series of which one
 * night is left is still a series: the family published it as one.
 */
export function groupForList<T extends { seriesId: string | null; nightDate: string }>(rows: readonly T[]): ListEntry<T>[] {
  const entries: ListEntry<T>[] = [];
  const series = new Map<string, T[]>();
  for (const row of rows) {
    if (row.seriesId === null) {
      entries.push({ kind: "nuit", request: row });
      continue;
    }
    const nights = series.get(row.seriesId);
    if (nights) {
      nights.push(row);
      continue;
    }
    const first = [row];
    series.set(row.seriesId, first);
    entries.push({ kind: "serie", seriesId: row.seriesId, requests: first });
  }
  for (const nights of series.values()) nights.sort((a, b) => a.nightDate.localeCompare(b.nightDate));
  return entries;
}

type DigestRow = {
  seriesId: string | null;
  nightDate: string;
  startTime: string;
  extraHours: number;
  children: Children;
  babyAgeValue: number;
  babyAgeUnit: AgeUnit;
  communeIns: string;
};

/**
 * Groups one professional's digest into lines: the nights of one series that
 * read the same (the start, the extra hours, the children and their age) are
 * one line, in night order. A night edited apart from its series, a series of
 * one night here, and a one-off night are lines of their own. Lines follow
 * their first night.
 */
export function groupForDigest<T extends DigestRow>(rows: readonly T[]): T[][] {
  const lines = new Map<string, T[]>();
  const sorted = [...rows].sort((a, b) =>
    `${a.nightDate}T${a.startTime}`.localeCompare(`${b.nightDate}T${b.startTime}`),
  );
  sorted.forEach((row, i) => {
    const key = row.seriesId
      ? [row.seriesId, row.startTime, row.extraHours, row.children, row.babyAgeValue, row.babyAgeUnit, row.communeIns].join("|")
      : `nuit:${i}`;
    const line = lines.get(key);
    if (line) line.push(row);
    else lines.set(key, [row]);
  });
  return [...lines.values()];
}

/** One entry of her list (JAM-302): a night, or the nights of a regular request answered as one. */
export type ProfessionalEntry<T> =
  | { kind: "nuit"; request: T }
  | { kind: "serie"; seriesId: string; requests: T[] };

/**
 * Groups her list: the nights of a regular request answered as one (JAM-302)
 * take the place of their first night in `rows`, in date order. A night of a
 * series published before JAM-302 stays a night of its own.
 */
export function groupForProfessional<T extends { seriesId: string | null; seriesWhole: boolean; nightDate: string }>(
  rows: readonly T[],
): ProfessionalEntry<T>[] {
  const entries: ProfessionalEntry<T>[] = [];
  const series = new Map<string, T[]>();
  for (const row of rows) {
    if (!row.seriesWhole || row.seriesId === null) {
      entries.push({ kind: "nuit", request: row });
      continue;
    }
    const nights = series.get(row.seriesId);
    if (nights) {
      nights.push(row);
      continue;
    }
    const first = [row];
    series.set(row.seriesId, first);
    entries.push({ kind: "serie", seriesId: row.seriesId, requests: first });
  }
  for (const nights of series.values()) nights.sort((a, b) => a.nightDate.localeCompare(b.nightDate));
  return entries;
}
