import { sql, type SQL, type SQLWrapper } from "drizzle-orm";

import { NIGHT_HOURS } from "./rules";

export type NightColumns = { nightDate: SQLWrapper; startTime: SQLWrapper; extraHours: SQLWrapper };

/**
 * The night's end in SQL, the twin of `endTime` and `hasNightEnded` in
 * `./rules.ts`: the night's date plus its start plus 11 hours plus its extra
 * hours, a Brussels wall-clock timestamp. Every query that names the night's
 * end reads it here, so no other file adds 11 hours. The columns come from the
 * caller: Drizzle's `careRequests` columns, or `sql` fragments for a raw query
 * with its own alias (`sql\`r.night_date\``).
 */
export function nightEnd(columns: NightColumns): SQL {
  // The extra hours go by half hours (JAM-303): the interval is counted in minutes.
  const minutes = sql`((${NIGHT_HOURS}::int + ${columns.extraHours}) * 60)::int`;
  return sql`(${columns.nightDate} + ${columns.startTime} + make_interval(mins => ${minutes}))`;
}
