import "server-only";

import { desc, eq } from "drizzle-orm";

import { db, professionalDeclarations, professionalProfiles } from "@/db";

import { needsNewDeclarations } from "./rules";

/**
 * Whether her file must accept the declarations again before her space opens
 * (`needsNewDeclarations`): one read of her status and the version of her last
 * acceptance. A user with no profile row has nothing to renew.
 */
export async function mustRenewDeclarations(userId: string): Promise<boolean> {
  const [row] = await renewalQuery(userId);
  return row ? needsNewDeclarations(row.status, row.version) : false;
}

/**
 * `mustRenewDeclarations`' statement for her user, built and not run: her
 * status and the version of her latest acceptance. A left join, not a `sql`
 * subquery: in a single-table select Drizzle renders a column inside a `sql`
 * field by its bare name, so `profile_id = id` compared two columns of
 * `professional_declarations` and every submitted file looped on the
 * re-acceptance page (triage/professionnelle-declarations-boucle). The join
 * qualifies both sides. The newest acceptance comes first, and a profile with
 * no acceptance yet reads one row with a null version.
 */
export function renewalQuery(userId: string) {
  return db
    .select({ status: professionalProfiles.status, version: professionalDeclarations.version })
    .from(professionalProfiles)
    .leftJoin(professionalDeclarations, eq(professionalDeclarations.profileId, professionalProfiles.id))
    .where(eq(professionalProfiles.userId, userId))
    .orderBy(desc(professionalDeclarations.acceptedAt))
    .limit(1);
}
