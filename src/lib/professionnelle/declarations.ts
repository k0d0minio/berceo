import "server-only";

import { eq, sql } from "drizzle-orm";

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

/** `mustRenewDeclarations`' statement for her user, built and not run: her status and the version of her latest acceptance. */
export function renewalQuery(userId: string) {
  return db
    .select({
      status: professionalProfiles.status,
      version: sql<string | null>`(
        select ${professionalDeclarations.version} from ${professionalDeclarations}
        where ${professionalDeclarations.profileId} = ${professionalProfiles.id}
        order by ${professionalDeclarations.acceptedAt} desc
        limit 1
      )`,
    })
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId))
    .limit(1);
}
